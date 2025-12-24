import { raw } from "body-parser";
import db from "../models/index";
import { Op } from "sequelize";

export const expirePendingBookingsJob = async () => {
  const t = await db.sequelize.transaction();
  try {
    const now = new Date();

    const expired = await db.Booking.findAll({
      where: {
        statusId: "S1",
        expiresAt: { [Op.lte]: now },
      },
      raw: false,
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    for (const b of expired) {
      const schedule = await db.Schedule.findOne({
        where: {
          doctorId: b.doctorId,
          date: String(b.date),
          timeType: b.timeType,
        },
        raw: false,
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (schedule) {
        const current = Number(schedule.currentNumber || 0);
        schedule.currentNumber = Math.max(0, current - 1);
        await schedule.save({ transaction: t });
      }

      b.statusId = "S4";
      await b.save({ transaction: t });
    }

    await t.commit();
  } catch (e) {
    await t.rollback();
    console.log("expirePendingBookingsJob error", e);
  }
};

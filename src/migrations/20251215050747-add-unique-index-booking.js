'use strict';

/** @type {import('sequelize-cli').Migration} */
"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex(
      "Bookings",
      ["patientId", "doctorId", "date", "timeType"],
      {
        unique: true,
        name: "uniq_booking_patient_doctor_date_time",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "Bookings",
      "uniq_booking_patient_doctor_date_time"
    );
  },
};


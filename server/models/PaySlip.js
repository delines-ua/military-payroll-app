const mongoose = require('mongoose');

const paySlipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Замінюємо month/year на paymentDate
    paymentDate: {
      type: Date,
      required: [true, "Будь ласка, вкажіть дату нарахування"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Будь ласка, вкажіть суму"],
      default: 0,
    },
    // Можна додати поле для деталей, опису тощо
    description: {
        type: String,
        default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Додаємо індекс для швидкого пошуку за користувачем та датою
paySlipSchema.index({ user: 1, paymentDate: -1 });

const PaySlip = mongoose.model('PaySlip', paySlipSchema);

module.exports = PaySlip;

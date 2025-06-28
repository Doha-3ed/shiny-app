import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cart',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'], // replace with your actual PaymentMethod options
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'delivered', 'canceled', 'refunded'], // replace with your actual OrderStatus options
    required: true
  },
  arrivesAt: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  orderChanges: {
    paidAt: Date,
    deliveredAt: Date,
    canceledAt: Date,
  },
  orderNo: {
    type: String,
    unique: true
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const OrderModel = mongoose.model('Order', orderSchema);
export default OrderModel;

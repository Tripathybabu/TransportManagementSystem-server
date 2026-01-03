import mongoose from 'mongoose';

const ShipmentSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true, index: true },
    origin: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    scheduledAt: { type: Date, index: true },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', index: true }
  },
  { timestamps: true }
);

ShipmentSchema.index({ status: 1, scheduledAt: -1 });
ShipmentSchema.index({ origin: 1, destination: 1 });

export const ShipmentModel = mongoose.model('Shipment', ShipmentSchema);

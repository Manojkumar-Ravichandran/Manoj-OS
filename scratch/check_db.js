import mongoose from 'mongoose';
import dbConnect from './lib/mongodb.js';
import Instrument from './lib/models/Instrument.js';
import Zone from './lib/models/Zone.js';

async function check() {
  await dbConnect();
  const instCount = await Instrument.countDocuments();
  const zoneCount = await Zone.countDocuments();
  console.log('Instruments:', instCount);
  console.log('Zones:', zoneCount);
  process.exit(0);
}

check();

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Alert from '@/lib/models/Alert';

export async function GET() {
  try {
    await dbConnect();
    const alerts = await Alert.find({}).sort({ dueDate: 1 });
    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const alert = await Alert.create(body);
    return NextResponse.json({ success: true, data: alert });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Alert.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

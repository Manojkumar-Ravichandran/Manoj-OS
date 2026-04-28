import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Holding from "@/lib/models/Holding";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { _id, ...updateData } = body;

    const holding = await Holding.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });
    
    if (!holding) {
      return NextResponse.json({ success: false, error: "Holding not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: holding });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deletedHolding = await Holding.deleteOne({ _id: id });
    if (!deletedHolding.deletedCount) {
      return NextResponse.json({ success: false, error: "Holding not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

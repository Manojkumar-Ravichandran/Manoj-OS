import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    // Remove _id from body to avoid trying to update it
    const { _id, ...updateData } = body;
    
    const transaction = await Transaction.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deletedTransaction = await Transaction.deleteOne({ _id: id });
    if (!deletedTransaction.deletedCount) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

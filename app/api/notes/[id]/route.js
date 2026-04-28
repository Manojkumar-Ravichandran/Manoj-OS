import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Note from "@/lib/models/Note";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const note = await Note.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deletedNote = await Note.deleteOne({ _id: id });
    if (!deletedNote.deletedCount) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myqgvtknkeilmcxriqhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cWd2dGtua2VpbG1jeHJpcWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4NTUwODcsImV4cCI6MjAyOTQzMTA4N30.GmiWzn2Lr6fD99UvA69qmS7NyAijGh0Zb_-EGKEXGMY';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
    try {
        // Find a room with only one member
        const { data: rooms, error: fetchError } = await supabase
            .from('room')
            .select('*')
            .eq('members', 1);

        if (fetchError) throw fetchError;

        let roomId;
        
        if (rooms.length > 0) {
            // Select a random room from the array
            const randomRoomIndex = Math.floor(Math.random() * rooms.length);
            roomId = rooms[randomRoomIndex].id;

            // Add user to the selected room
            const { error: updateError } = await supabase
                .from('room')
                .update({ members: 2 })
                .eq('id', roomId);

            if (updateError) throw updateError;
        } else {
            // Create a new room and add the user
            const { data: newRoom, error: insertError } = await supabase
                .from('room')
                .insert({ members: 1 })
                .select();

            if (insertError) throw insertError;

            roomId = newRoom[0].id;
        }

        return NextResponse.json({ roomId }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { roomId } = await req.json();

        // Retrieve the current members of the room
        const { data: room, error: fetchError } = await supabase
            .from('room')
            .select('members')
            .eq('id', roomId)
            .single();

        if (fetchError) throw fetchError;

        let members = room.members;

        // Decrease the count of members
        if (members === 1) {
            // If the member count is 1, delete the room
            const { error: deleteError } = await supabase
                .from('room')
                .delete()
                .eq('id', roomId);

            if (deleteError) throw deleteError;
        } else {
            // Otherwise, decrease the member count
            members -= 1;
            const { error: updateError } = await supabase
                .from('room')
                .update({ members })
                .eq('id', roomId);

            if (updateError) throw updateError;
        }

        return NextResponse.json({ message: 'Operation successful' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

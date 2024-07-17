import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myqgvtknkeilmcxriqhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cWd2dGtua2VpbG1jeHJpcWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4NTUwODcsImV4cCI6MjAyOTQzMTA4N30.GmiWzn2Lr6fD99UvA69qmS7NyAijGh0Zb_-EGKEXGMY';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req){

    const {data,error} = await supabase.from('Chatroom').select('*')

    if(error){

        return NextResponse.json({ error: error.message }, { status: 500 });

    }
    else{
        return NextResponse.json(data, { status: 200 });
    }



}



export async function POST(req) {

    const data = await req.json()

    const { error } = await supabase.from('Chatroom').insert(data)

    if(error){

        return NextResponse.json({ error: error.message }, { status: 500 });

    }
    else{
        return NextResponse.json({ msg: 'Success'}, { status: 200 });
    }
   
}

export async function DELETE(req) {
    
        //return NextResponse.json({ error: error.message }, { status: 500 });
    
}

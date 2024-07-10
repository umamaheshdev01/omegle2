'use client'

import { createClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';

const supabaseUrl = 'https://myqgvtknkeilmcxriqhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cWd2dGtua2VpbG1jeHJpcWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4NTUwODcsImV4cCI6MjAyOTQzMTA4N30.GmiWzn2Lr6fD99UvA69qmS7NyAijGh0Zb_-EGKEXGMY';
const supabase = createClient(supabaseUrl, supabaseKey);

function Page() {

    const [user,setUser] = useState(0)


    supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room' },
        async (payload) => {
          await fetchData()
        }
      )
  .subscribe();

  const fetchData = async () => {
    const { data, error } = await supabase.from('room').select('*');
    if (error) {
      console.error(error);
    } else {
      console.log(data.length);
      setUser(data.length)
    }
  }

  const deleteShi = async ()=>{
    const {data,error} = await supabase.from('room').delete().neq('id',0)
    console.log(error)
  }

  useEffect(() => {
    fetchData()
  }, []);

  return (
    <div className='flex flex-col h-screen items-center justify-center'>
      <p>Rooms : {user}</p>
      
      <button onClick={deleteShi} className='border-black border-2 m-2 p-2 bg-blue-400'>Clear</button>
    </div>
  )
}

export default Page;

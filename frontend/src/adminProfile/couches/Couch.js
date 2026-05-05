// src/components/CourtsAdmin.js
import React, { useState, useEffect } from 'react'

import { backendAccessGet, backendAccessPost } from '../../utils/Authentication'
import CouchReservationDaily from './components/Couch-grid-reservation'
import CouchAll from './components/Couch-all';
import { Link, useParams } from 'react-router-dom';

const AdminCouch = () => {
    const { id } = useParams();
    const [ reservations, setReservations] = useState()
    const [ couch, setCouch] = useState()
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState([]);

    const styles = {
        selectableDay: { backgroundColor: '#ffe6d3', color: '#fe7a15', border: '0.01px solid #fe7a1530' },
        selectableHover: { backgroundColor: '#FF6F00', color: '#fff' },
        selectedDay: { backgroundColor: '#FF6F00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    useEffect(() => {
        const fetchData = async () => {
          try {
            setLoading(true);
      
            const reservationsResponse = await backendAccessGet(
              `/api/reserved/fetch-couch/${id}/`
            );
      
            setReservations(reservationsResponse.reserved || []);
      

            const approvedMembersResponse = await backendAccessGet(
                `/api/members/approved/`
              );            setMembers(approvedMembersResponse["approved_members"] || []);

            const couchResponse = await backendAccessGet(
              `/api/couch/fetch-by-id/${id}/`
            );
      
            setCouch(
                Array.isArray(couchResponse.couch)
                  ? couchResponse.couch
                  : [couchResponse.couch]
              )   
                   } catch (err) {
            console.error(err);
            setReservations([]);
          } finally {
            setLoading(false);
          }
        };
      
        if (id) fetchData();
      }, [id]);
      



    return (
        <>
            <div className='flex flex-col w-full h-full space-y-[15px]'>

<CouchAll with_add_modal={false} couches={couch} reservations={reservations} />
<CouchReservationDaily
                            reservations={reservations}
                            setReservations={setReservations}
                            members={members}
           
                        />

            </div>


        </>
    )
}

export default AdminCouch
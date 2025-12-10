
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import { Logout as LogoutIcon } from '@mui/icons-material';

import "./Home.css"
import withAuth from '../utils/withAuth';    // we not access the History page until Login the page

function History() {

    const { getHistoryOfUser } = useContext(AuthContext);
    const { deleteHistoryItem } = useContext(AuthContext);
    const [ meetings, setMeetings ] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(Array.isArray(history) ? history : []);
            } catch (err) {
               console.log(err)
            }
        }

        fetchHistory();
    }, [])


    const handleDelete = async (meetingId, event) => {
        event.preventDefault();
    
        try {
            if (!window.confirm("Are you sure you want to delete this meeting history?")) {
                return;
            }
            await deleteHistoryItem(meetingId);
            
            // Update the UI by removing the deleted item
            setMeetings(prevMeetings => 
                prevMeetings.filter(meeting => meeting._id !== meetingId)
            );
            
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };



    // For Now Date
    let formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) return ''; // guard for invalid date
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();
        return `${day}/${month}/${year}`
    }


    return (
        <div>
            <div className=''>
                <nav style={{borderBottom: "2px solid black"}}>
                    
                    <h2 style={{textAlign: "center"}}>History</h2>
                    
                    <div className="navlist" style={{marginRight: "0px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                        
                        <IconButton style={{color: "black", fontSize: "20px"}} onClick={() => { navigate("/home")}}><LogoutIcon /> Back </IconButton >
                      
                    </div>
                </nav>
            </div>

            {
                Array.isArray(meetings) && meetings.length !== 0 ? meetings.map((e, i) => {
                    return (
                        <Card key={i} variant="outlined" style={{display: "flex", justifyContent: "space-between"}}>
                            <CardContent>
                                {/* <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                                    <b>Username :</b> {e.user_id}
                                </Typography> */}
                                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                                    <b>Meeting Code :</b> {e.meetingCode}
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    <b>Date : </b>{formatDate(e.date)}, <b>Time</b>  {e.time}
                                </Typography>
                            </CardContent>
                            <DeleteIcon onClick={(event) => handleDelete(e._id, event)}  style={{marginRight: "3rem", marginTop: "1rem", color:"red", cursor: "pointer"}}></DeleteIcon>
                        </Card>
                    )
                }) : <></>
            }

        </div>
    )
}


export default withAuth(History)        // the use of withAuth , jab tak hm log in nhi krte tab tak hm us page pr nhi ja skte
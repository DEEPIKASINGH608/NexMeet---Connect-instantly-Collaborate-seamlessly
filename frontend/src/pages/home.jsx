import React from 'react'
import withAuth from '../utils/withAuth';

function HomeComponent() {

    let navigate = useNavigator();
        const [meetingCode, setMeetingCode] = useState("");
        let handleJoinVideoCall = async () => {
            navigate(`/${meetinCode}`)
        }

    return (
        <>
            <div className="navBar">
                <div style={{display: "flex", alignItems: "center"}}>
                    <h3>NexMeet</h3>
                </div>
            </div>

        </>
    )
}

export default withAuth(HomeComponent)
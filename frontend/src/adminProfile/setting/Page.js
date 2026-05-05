import React, { useEffect, useState } from 'react';
import { backendAccessPost, backendAccessGet } from '../../utils/Authentication';
import Header from './components/Header';
import SettingSection from './components/SettingSection';
import Category from './components/Category';

const Settingpage = () => {
    const [settingdata, setSettingdata] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showsetting, setshowsetting] = useState(true)
    const [showcategory, setShowcategory] = useState(false)

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const response = await backendAccessGet('/api/setting/fetch/');
                const settings = response["settings"];
                setSettingdata(settings || []);


            } catch (err) {
                console.error(err);
                setError("Failed to load setting");
            } finally {
                setLoading(false);
            }
        };

        fetchSetting();
    }, []);




    return (
        <div className='flex flex-col space-y-[15px] w-full'>

            <Header
                showcategory={showcategory}
                showsetting={showsetting}
                setshowsetting={setshowsetting}
                setshowcategory={setShowcategory}
            />
            {showsetting &&
                <SettingSection />
            }
            {showcategory &&
                <Category />
            }

        </div>
    )
}
export default Settingpage;
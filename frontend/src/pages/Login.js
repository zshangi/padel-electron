
import { Link, useNavigate } from 'react-router-dom';

import { useState } from "react"

import { login, verify, me } from '../utils/Authentication'
import Input from '../adminProfile/components/Input'

import { Profiler } from "react";

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });
}

export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [hasError, setHasError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    let navigate = useNavigate()

    const submit = (e) => {
        setIsSubmitting(true);

        e.preventDefault()
        if (username !== "" && password !== "") {
            login({ username, password }).then((me) => {
                if (me) {
                    setHasError(false);
                    if (me.is_superuser) {
                        navigate("/admin-courts");
                    } else {
                        navigate("/user-home?typeCategory=court&mode=single");
                    }
                } else {
                    setHasError(true);
                }
            });


        }
    }

    const keyPress = (e) => {
        if (e.charCode == 11) {
            submit(e)
        }
    }

    return (


    <Profiler id="MyComponent" onRender={onRenderCallback}>



        <div
            className='flex w-[100%] h-screen  justify-center items-center body-farsi bg-[#fff] text-[10px] overflow-x-hidden'
            style={{ direction: 'rtl' }}
        >
            <div className='flex flex-col w-full space-y-[20px] justify-start items-center'>
        <img src={'/images/paledvand.png'} className="w-[250px] h-auto" />
                    <form onSubmit={submit} className='flex flex-col space-y-[10px] w-full items-center h-fit '>
                        <Input
                            label="نام کاربری/شماره تلفن همراه"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                                                  width={250}
                                                  labelAlign='inside'

                        />

                        <Input
                            label="رمزعبور  :"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                                                  width={250}
                                                  labelAlign='inside'

                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-[250px] h-[30px] text-[#fff] bg-[#ffcc08] text-[10px] rounded hover:bg-[#000] hover:text-[#fff] transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "در حال ورود..." : "ورود "}
                        </button>
                        {/* <div className='w-[150px] float-start'>
                            <Link to="/signup" className='body-farsi-fa text-[#000]'> عضو باشگاه نیستید اینجا کلیک کنید  </Link>
                        </div> */}

                    </form>
            </div>
        </div>
</Profiler>
    )
}

import react from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import Spinner from './Spinner';
const CreatePost = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const handleFuction = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setLoading(true);
        await axios.post("http://localhost:3000/create-post", formData).then((res) => {
            // alert("successfully form submited");
            // e.target.reset()
            navigate("/feed")
        }).catch((error) => {
            console.log(error);
            alert("something went wrong");
        })
        //if we get the data loading change to false 
        setLoading(false);
    }
    return (

        <div className='max-w-[400px] h-[400px] mx-auto mt-[180px] border-2 border-black rounded-md px-[30px] py-[30px] flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 '>
            {
                loading ? (<Spinner/>) :
                    (<section className=' w-[300px] h-[300px]  p-[20px] border-2 border-gray-500   rounded-lg bg-gradient-to-br 
                    from-orange-400 to-red-300 '>
                        <h1 className='my-[30px] text-[20px] font-bold text-center'>Create post</h1>
                        <form className='flex flex-col space-y-[20px]' onSubmit={handleFuction}>
                            {/* image and caption are the schema that we use in the model  */}
                            <input    type="file" name="image" accept="image/*"></input>
                            <input className='rounded-md h-[30px] w-[250px] p-[10px] ' type="text" name="caption" placeholder='enter caption'></input>
                            <button className='w-[250px] border-2  bg-green-400 rounded-lg font-extrabold hover:bg-blue-400' type='submit'>SUBMIT</button>
                        </form>
                    </section>)
            }
        </div>
    )
}
export default CreatePost;
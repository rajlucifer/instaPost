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

        <div>
            {
                loading ? (<Spinner/>) :
                    (<section className='max-w-2xl h-[520px] mx-auto mt-[60px] border-2 border-black rounded-md px-[50px] py-[60px]  bg-yellow-300 '>
                        <h1 className='my-[30px] text-[20px] font-bold'>Create post</h1>
                        <form className='flex flex-col space-y-[20px]' onSubmit={handleFuction}>
                            {/* image and caption are the schema that we use in the model  */}
                            <input type="file" name="image" accept="image/*"></input>
                            <input type="text" name="caption" placeholder='enter caption'></input>
                            <button className='border-2 border-gray-500 rounded-lg font-extrabold' type='submit'>SUBMIT</button>
                        </form>
                    </section>)
            }
        </div>
    )
}
export default CreatePost;
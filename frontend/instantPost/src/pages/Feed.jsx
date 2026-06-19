import react from 'react'
import { useState } from 'react'
import axios from "axios"
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
    //all the data always goes in the posts in array form 
    const [posts, setPost] = useState([]);
    const navigate = useNavigate()
    const fetchData = async () => {
        const res = await axios.get("http://localhost:3000/posts");
        console.log(res.data);
        //here we get the error because we data [{},{}] all data of api it gives to the posts like this [{},{}]
        setPost(res.data.data);
    };
    useEffect(() => {
        fetchData();



    }, [])
    return (
        <div className='max-w-6xl   mx-auto   px-[30px] py-[30px]  '>
            <h1 className='text-center font-extrabold text-[30px]'>GALLERY</h1>
            <div>
                    <button className='border-2 border-gray-600 text-white bg-green-600 px-5 py-3 font-extrabold rounded-md' onClick={()=>{navigate("/")}}>HomePage</button>
            </div>
            <section className='grid  sm:grid-cols-1 md:grid-cols-2  lg:grid-cols-3  gap-1  items-center justify-center '>
                {
                    posts.length > 0 ?
                        (posts.map((post) => (
                            <div className='w-[300px] h-[300px]    border-2 border-black  rounded-md mt-[30px] hover:scale-110 
                            transition duration-300 ease-in cursor-pointer hover:bg-yellow-200 ' key={post._id}>
                                <div className='flex flex-col m-[20px]  items-center justify-center  '>
                                    <div className=' w-[250px] h-[250px]    ' >
                                        <img className=' w-full h-full object-cover  rounded-md' src={post.image} alt="" />

                                    </div>
                                    <div>
                                        <p className='text-black uppercase font-extrabold'>{post.caption}</p>
                                    </div>
                                </div>

                            </div>
                        )


                        )) : (<div>NO POST IS AVAILABLE</div>)
                }
                 
            </section>

        </div>
    )
};

export default Feed;
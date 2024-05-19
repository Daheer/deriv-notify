"use client"; // Ensure this is a client-side component

import SubscribeTicks from './components/subscribeTicks';

const HomePage = () => {
  return (
    <div className='flex flex-col m-4 items-center gap-4'>
      {/* <h1 className='text-2xl'>Deriv Notify</h1> */}
      {/* <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Deriv Notify</h1> */}
      <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-red-500">Deriv Notify</h1>
      <div>
        <SubscribeTicks />
      </div>
    </div>
  );
};

export default HomePage;

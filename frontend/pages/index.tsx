import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/solid';

import { Stations } from 'components/Stations';
import { Adsense } from 'components/Adsense';

export const Home: React.FC = () => {
  return (
    <>
      <div className="pt-6 pb-24 mx-auto px-4 sm:pt-12 sm:px-6 md:pt-10 bg-gradient-to-b from-white to-gray-200">
        <div className="text-center">
          <h2 className="text-4xl font-sans text-gray-700 sm:leading-none md:text-4xl">
            xmplaylist
          </h2>
          <p className="mt-3 mx-auto text-base text-gray-600 sm:text-lg md:mt-5 xl:text-xl">
            Recently played songs on XM Sirius radio
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pb-3 px-1 md:px-4 sm:px-6 lg:px-8 text-center">
        <Adsense />
      </div>

      <main>
        <div className="max-w-7xl mx-auto pb-12 px-1 md:px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-blue-50 p-4 mb-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-4 w-4 text-blue-500" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  (April 14th) New spotify playlists have been created. The old ones will no longer
                  be updated.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-2xl px-3 py-6 sm:px-6">
            <Stations autoFocus={false} />
          </div>
        </div>
      </main>
      <div className="max-w-7xl mx-auto pb-3 px-1 md:px-4 sm:px-6 lg:px-8 adsbygoogle">
        <Adsense />
      </div>
    </>
  );
};

export default Home;

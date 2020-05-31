import React from 'react';
import { useObserver } from 'mobx-react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';

import { useStores } from 'services/useStores';
import { SubscribeToggle } from 'components/SubscribeToggle';

function useUserData() {
  const { user } = useStores();
  return useObserver(() => ({
    email: user.user?.email,
    metadata: user.user?.metadata,
    logout: user.logout,
    loggedIn: user.loggedIn,
    setIsSubscribed: user.setIsSubscribed,
    isSubscribed: user.isSubscribed,
  }));
}

const Profile = () => {
  const { email, metadata, logout, loggedIn, setIsSubscribed, isSubscribed } = useUserData();
  const router = useRouter();

  if (loggedIn === false) {
    router.push('/login');
  }

  const handleLogOut = () => {
    logout();
    router.push('/login');
  };

  return (
    <main className="max-w-lg mx-auto px-1 mb-10 md:px-4 sm:px-6 lg:px-8 my-2 mt-4">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
          <p className="max-w-2xl text-sm leading-5 text-gray-500">User settings</p>
        </div>
        <div className="mt-5 border-t border-gray-200 pt-5">
          <dl>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm leading-5 font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                {email}
              </dd>
            </div>
            <div className="mt-8 sm:grid sm:mt-5 sm:grid-cols-3 sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <dt className="text-sm leading-5 font-medium text-gray-500">User Level</dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="inline-flex mr-2 items-center px-3 py-0.5 rounded-full text-sm font-medium leading-5 bg-gray-100 text-gray-800">
                  Free
                </span>
                <span className="text-gray-700">Upgrade (coming soon)</span>
              </dd>
            </div>
            <div className="mt-8 sm:grid sm:mt-5 sm:grid-cols-3 sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <dt className="text-sm leading-5 font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                {metadata && format(new Date(metadata?.creationTime as string), 'PPpp')}
              </dd>
            </div>
            <div className="mt-8 sm:grid sm:mt-5 sm:grid-cols-3 sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <dt className="text-sm leading-5 font-medium text-gray-500">Last Login</dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                {metadata && format(new Date(metadata?.lastSignInTime as string), 'PPpp')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <SubscribeToggle isSubscribed={isSubscribed ?? false} onChange={setIsSubscribed} />
      <div className="my-2">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm leading-5 font-medium rounded-md bg-white text-gray-500 hover:text-white hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
          onClick={handleLogOut}
        >
          <FontAwesomeIcon className="mr-2 h-5 w-5" icon="sign-out-alt" />
          Sign Out
        </button>
      </div>
    </main>
  );
};

export default Profile;
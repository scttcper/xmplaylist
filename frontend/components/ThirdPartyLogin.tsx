import React from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import {
  GoogleAuthProvider,
  signInWithPopup,
  useDeviceLanguage,
  TwitterAuthProvider,
  getAdditionalUserInfo,
  UserCredential,
} from 'firebase/auth';

import { extractUser, login } from 'services/userSlice';
import { auth } from 'services/firebase';
import { Twitter } from './icons/Twitter';
import { Google } from './icons/Google';

type Props = {
  handleError: (error: Error) => void;
};

export const ThirdPartyLogin = ({ handleError }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();

  async function postLogin(method: string, userCredential: UserCredential | null) {
    if (!userCredential || !userCredential.user) {
      throw new Error('Error');
    }

    dispatch(login(extractUser(userCredential.user)));

    gtag('event', 'login', {
      method,
    });

    if (getAdditionalUserInfo(userCredential)?.isNewUser) {
      await router.push('/newUser');
    } else {
      await router.push('/profile');
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useDeviceLanguage(auth);
      const userCredential = await signInWithPopup(auth, provider);
      if (!userCredential || !userCredential.user) {
        throw new Error('Error');
      }

      postLogin('google', userCredential);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const handleTwitterLogin = async () => {
    try {
      const provider = new TwitterAuthProvider();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useDeviceLanguage(auth);
      const userCredential = await signInWithPopup(auth, provider);

      postLogin('twitter', userCredential);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      {/* <div>
        <span className="w-full inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out"
            aria-label="Sign in with Facebook"
          >
            <svg className="h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </span>
      </div> */}

      <div>
        <span className="w-full inline-flex rounded-md shadow-sm">
          <button
            type="button"
            id="twitter"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out"
            aria-label="Sign in with Twitter"
            onClick={handleTwitterLogin}
          >
            <Twitter className="h-4 w-4" />
          </button>
        </span>
      </div>

      <div>
        <span className="w-full inline-flex rounded-md shadow-sm">
          <button
            type="button"
            id="google"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out"
            aria-label="Sign in with Google"
            onClick={handleGoogleLogin}
          >
            <Google className="h-4 w-4" />
          </button>
        </span>
      </div>
    </div>
  );
};

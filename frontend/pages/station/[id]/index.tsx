import { formatDistanceStrict, format, subHours } from 'date-fns';
import axios from 'axios';
import chunk from 'lodash.chunk';
import { NextComponentType, NextPageContext } from 'next';
import Error from 'next/error';
import Head from 'next/head';
import React, { useState } from 'react';

import { channels } from '../../../channels';
import { StationHeader } from 'components/StationHeader';
import { StreamCardsLayout } from 'components/StreamCardsLayout';
import { Adsense } from 'components/Adsense';
import { StationRecent, TrackResponse } from 'frontend/responses';
import { url } from '../../../url';

interface StationProps {
  recent: StationRecent[][];
  channelId: string;
}

function getLastStartTime(recent: StationRecent[]): number {
  const last = recent[recent.length - 1].start_time;
  return new Date(last).getTime();
}

const secondaryText = (track: TrackResponse): React.ReactNode => {
  const date = new Date((track as StationRecent).start_time);
  const timeAgo = formatDistanceStrict(date, new Date(), {
    addSuffix: true,
  });

  return (
    <>
      {`${timeAgo} - `}
      <time title={format(date, 'PPpp')} dateTime={date.toISOString()}>
        {format(date, 'p')}
      </time>
    </>
  );
};

const StationPage: NextComponentType<NextPageContext, any, StationProps> = props => {
  const { channelId } = props;
  const lowercaseId = channelId.toLowerCase();
  const channel = channels.find(
    channel => channel.deeplink.toLowerCase() === lowercaseId || channel.id === lowercaseId,
  );

  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<StationRecent[][]>(props.recent);

  if (!channel) {
    return <Error statusCode={404} />;
  }

  async function fetchMore(): Promise<void> {
    setLoading(true);
    const lastDateTime = getLastStartTime(recent[recent.length - 1]);
    const res = await fetch(`${url}/api/station/${channelId}?last=${lastDateTime}`);
    const json = await res.json();
    setLoading(false);
    setRecent([...recent, ...chunk<any>(json, 12)]);
  }

  async function jumpBack(event: React.ChangeEvent<HTMLSelectElement>): Promise<void> {
    setLoading(true);
    const hoursAgo = Number(event.target.value);
    // Reset jumpBack dropdown
    event.target.selectedIndex = 0;
    const lastDateTime = subHours(new Date(recent[0][0].start_time), Number(hoursAgo)).getTime();
    const res = await fetch(`${url}/api/station/${channelId}?last=${lastDateTime}`);
    const json = await res.json();
    setLoading(false);
    setRecent(chunk<any>(json, 12));
  }

  return (
    <>
      <Head>
        <title>{channel.name} Recently Played and Playlist - XM Playlist</title>
        <meta
          name="description"
          content={`Recently played songs on ${channel.name}. ${channel.name} playlist. ${channel.desc}`}
        />
        <meta
          property="og:image"
          content={`https://xmplaylist.com/img/${channel.deeplink}-lg.png`}
        />
      </Head>
      <StationHeader channel={channel} currentPage="recent" />
      {/* Main body */}
      <main className="max-w-7xl mx-auto px-1 mb-10 md:px-4 sm:px-6 lg:px-8 my-2 md:mt-3">
        <div className="relative max-w-7xl mx-auto">
          <div className="flex justify-end mb-2">
            <div>
              <label
                htmlFor="jumpBack"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Jump back
              </label>
              <select
                id="jumpBack"
                className="mt-1 block form-select w-48 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                value={undefined}
                onChange={jumpBack}
              >
                <option>-</option>
                <option value={2}>4 hours</option>
                <option value={8}>8 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={36}>36 hours</option>
                <option value={48}>48 hours</option>
              </select>
            </div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <StreamCardsLayout tracks={recent} channel={channel} secondaryText={secondaryText} />
        </div>
        {/* Load More */}
        <div className="text-center my-5">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
            onClick={async () => fetchMore()}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      </main>
      <div className="max-w-7xl md:px-4 sm:px-6 lg:px-8 mb-5 mx-auto adsbygoogle my-2">
        <Adsense />
      </div>
    </>
  );
};

StationPage.getInitialProps = async ({ query, req, res }) => {
  const id = query?.id as string;
  const lowercaseId = id.toLowerCase();
  const channel = channels.find(
    channel => channel.deeplink.toLowerCase() === lowercaseId || channel.id === lowercaseId,
  );

  if (!channel) {
    return { recent: [], channelId: id };
  }

  let headers: any;
  if (!process.browser) {
    res?.setHeader?.('Cache-Control', 'public, max-age=120, must-revalidate');
    headers = {
      'x-real-ip': req?.headers?.['x-real-ip'] ?? '',
    };
  }

  try {
    const response = await axios.get(`${url}/api/station/${id}`, { timeout: 15 * 1000, headers });
    return { recent: chunk(response.data, 12), channelId: id };
  } catch (error) {
    return { recent: [], channelId: id };
  }
};

export default StationPage;

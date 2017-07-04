import * as debug from 'debug';
import * as Koa from 'koa';
import * as kcors from 'kcors';
import * as logger from 'koa-logger';
import * as koaRaven from 'koa2-raven';
import * as Raven from 'raven';
import * as Router from 'koa-router';
import * as _ from 'lodash';
import * as sequelize from 'sequelize';
import { subDays } from 'date-fns';
import * as Sequelize from 'sequelize';

import config from '../config';
import { channels } from './channels';
import { getRecent, mostHeard } from './plays';
import { Track, Artist, Play, Spotify } from '../models';
import { spotifyFindAndCache, addToPlaylist } from './spotify';
const tracks = require('./tracks');

const log = debug('xmplaylist');
const app = new Koa();
export default app;
app.proxy = true;
const router = new Router();

app.use(kcors());
if (process.env.NODE_ENV === 'dev') {
  app.use(logger());
}
if (config.dsn) {
  const sentry = Raven
    .config(config.dsn, { autoBreadcrumbs: true })
    .install({ captureUnhandledRejections: true });
  koaRaven(app, sentry);
}
app.use((ctx, next) => {
  ctx.type = 'json';
  return next();
});

// routes
router.get('/recent/:id', async (ctx, next) => {
  ctx.assert(ctx.params.id, 400, 'Channel does not exist');
  const channel = _.find(channels, _.matchesProperty('id', ctx.params.id));
  ctx.assert(channel, 400, 'Channel does not exist');
  if (ctx.query.last) {
    const last = new Date(parseInt(ctx.query.last, 10));
    ctx.body = await getRecent(channel, last);
  } else {
    ctx.body = await getRecent(channel);
  }
  return next();
});

router.get('/mostHeard/:id', async (ctx, next) => {
  ctx.assert(ctx.params.id, 400, 'Channel does not exist');
  const channel = _.find(channels, _.matchesProperty('id', ctx.params.id));
  ctx.assert(channel, 400, 'Channel does not exist');
  ctx.body = await mostHeard(channel);
  return next();
});

router.get('/track/:trackId', async (ctx, next) => {
  const trackId = ctx.params.trackId;
  ctx.assert(trackId, 400, 'Song ID required');
  ctx.body = await Track.findById(trackId, { include: [{ model: Artist }] })
    .then((t) => t.toJSON());
  const daysago = subDays(new Date(), 30);
  ctx.body.playsByDay = await Play.findAll({
    where: { trackId, startTime: { $gt: daysago } },
    attributes: [
      [sequelize.fn('date_trunc', 'day', sequelize.col('startTime')), 'day'],
      [sequelize.fn('COUNT', 'trackId'), 'count'],
    ],
    group: ['day'],
  }).then((t) => t.map((n) => n.toJSON()));
  return next();
});

router.get('/trackActivity/:id', async (ctx, next) => {
  const trackId = ctx.params.id;
  ctx.assert(trackId, 400, 'Song ID required');
  const daysago = subDays(new Date(), 30);
  ctx.body = await Play.findAll({
    where: { trackId, startTime: { $gt: daysago } },
    attributes: [
      [sequelize.fn('date_trunc', 'day', sequelize.col('startTime')), 'day'],
      [sequelize.fn('COUNT', 'trackId'), 'count'],
    ],
    group: ['day'],
  }).then((t) => t.map((n) => n.toJSON()));
  return next();
});

router.get('/artist/:id', async (ctx, next) => {
  const artistId = ctx.params.id;
  ctx.assert(artistId, 400, 'Artist ID required');
  const trackIds = await Track.findAll({
    attributes: ['id'],
    include: [{
      model: Artist,
      where: { id: artistId },
      attributes: [],
    }],
  }).then((t) => t.map((n) => n.get('id')));
  ctx.assert(trackIds.length, 400, 'No songs found');
  ctx.body = {};
  ctx.body.artist = await Artist.findById(artistId);
  ctx.body.tracks = await Track.findAll({
    where: { id: {$in: trackIds } },
    include: [Artist],
  });
  return next();
});

router.get('/channels', (ctx, next) => {
  ctx.body = channels.map((n) => {
    // n.img = `https://www.siriusxm.com/albumart/Live/Default/DefaultMDS_m_${n.number}.jpg`;
    n.img = `http://pri.art.prod.streaming.siriusxm.com/images/channel/20170503/${n.id}-1-31-00-180x180.png`;
    return n;
  });
  return next();
});

router.get('/spotify/:trackId', async (ctx, next) => {
  const trackId = ctx.params.trackId;
  let doc;
  try {
    doc = await spotifyFindAndCache(trackId);
  } catch (e) {
    ctx.throw(404, 'Not Found');
  }
  ctx.assert(doc, 404, 'Not Found');
  ctx.body = doc;
  return next();
});

router.get('/updatePlaylist', async (ctx, next) => {
  const code = ctx.query.code;
  if (!code) {
    ctx.redirect(`https://accounts.spotify.com/authorize?client_id=${config.spotifyClientId}&response_type=code&redirect_uri=${config.location}/updatePlaylist&scope=playlist-modify-public&state=xmplaylist`);
  }
  const thirtyDays = subDays(new Date(), 30);
  for (const chan of channels) {
    const trackIds = await Play.findAll({
      where: {
        channel: chan.number,
        startTime: { $gt: thirtyDays },
      },
      attributes: [Sequelize.fn('DISTINCT', Sequelize.col('trackId')), 'trackId'],
    }).then((t) => t.map((n) => n.get('trackId')));
    const spotifyIds = await Spotify.findAll({
      where: {trackId: {$in: trackIds } },
      attributes: ['spotifyId'],
    }).then((t) => t.map((n) => `spotify:track:${n.get('spotifyId')}`));
    const res = await addToPlaylist(code, chan.playlist, spotifyIds);
  }
  ctx.body = 'success';
  return next();
});
// app.use(route.get('/new', ep.newsongs));
// app.use(route.get('/song/:song', ep.songFromID));
// app.use(route.get('/songstream/:song', ep.songstream));

app
  .use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  log(`https://localhost:${config.port}`);
}

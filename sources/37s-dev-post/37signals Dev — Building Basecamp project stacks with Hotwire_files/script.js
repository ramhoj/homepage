import * as media from './modules/media.js';
import * as modal from './modules/modal.js';
import * as signup from './modules/signup.js';

document.addEventListener('DOMContentLoaded', () => {

  media.ready();

  modal.ready();

  signup.ready();

});

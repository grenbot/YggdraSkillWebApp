import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Fix TextEncoder/TextDecoder issue
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

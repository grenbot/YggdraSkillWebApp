import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Fix TextEncoder/TextDecoder issue (safe type cast to match Web API expectations)
import { TextEncoder, TextDecoder as NodeTextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = NodeTextDecoder as unknown as typeof TextDecoder;

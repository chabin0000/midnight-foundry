import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./browser-tests',workers:2,use:{baseURL:'http://127.0.0.1:8088',viewport:{width:1280,height:900}},webServer:{command:'python -m http.server 8088 --bind 127.0.0.1',url:'http://127.0.0.1:8088',reuseExistingServer:false}});

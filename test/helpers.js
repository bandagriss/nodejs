import supertest from "supertest";
import chai from "chai";
import app from "../index.js";

global.app=app;
//como supervisor ejecutara el servidor es para no tener dos consolas
global.request = supertest(app);
global.expect = chai.expect;


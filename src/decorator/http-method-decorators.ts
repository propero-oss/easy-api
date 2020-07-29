import { httpMethodDecorator } from "./http-method-decorator-facoty";

export const Get = httpMethodDecorator("GET");
export const Post = httpMethodDecorator("POST");
export const Put = httpMethodDecorator("PUT");
export const Delete = httpMethodDecorator("DELETE");
export const Head = httpMethodDecorator("HEAD");
export const Options = httpMethodDecorator("OPTIONS");

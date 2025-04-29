// Fix WebGL2 type conflicts
interface WebGLObject {}
declare let WebGL2RenderingContext: {
  new (): WebGL2RenderingContext;
  prototype: WebGL2RenderingContext;
};
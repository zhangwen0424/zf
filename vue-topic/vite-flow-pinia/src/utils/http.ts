import axios, { AxiosRequestConfig } from "axios";

// 设置返回数据的格式
export interface ResponseData<T> {
  code: number;
  data?: T;
  msg?: string;
  //..
}
class HttpRequest {
  public baseURL = import.meta.env.DEV ? "/api" : "/"; // 基本请求路径
  public timeout = 3000;

  // 每次请求都创建一个独一无二的实例 ， 为了保证 请求之间是互不干扰的
  public request(options: AxiosRequestConfig) {
    const instance = axios.create(); // 创建一个axios实例
    options = this.mergeOptions(options); // 合并请求选项
    this.setInterceptors(instance); // 设置拦截器
    return instance(options);
  }
  setInterceptors(instance: any) {
    // 配置请求拦截器
    instance.interceptors.request.use(
      (config) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        config.headers!["token"] = "bearer token";
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
    // 配置响应拦截器
    instance.interceptors.response.use(
      (res) => {
        const { code } = res.data;
        if (code !== 0) {
          return Promise.reject(res);
        }
        return res;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
  }
  // 合并请求选项
  mergeOptions(options: AxiosRequestConfig) {
    return Object.assign(
      {
        baseURL: this.baseURL,
        timeout: this.timeout
      },
      options
    );
  }
  public get<T>(url: string, data: unknown): Promise<ResponseData<T>> {
    // res.data.data
    return this.request({
      method: "get",
      url,
      params: data
    }).then(
      (res) => {
        return Promise.resolve(res.data);
      },
      (err) => {
        return Promise.reject(err);
      }
    );
  }
  public post<T>(url: string, data: unknown): Promise<ResponseData<T>> {
    // res.data.data
    return this.request({
      method: "post",
      url,
      data
    }).then(
      (res) => {
        return Promise.resolve(res.data);
      },
      (err) => {
        return Promise.reject(err);
      }
    );
  }
}
// 请求取消 需要维护页面的状态 base:{ 'a','b','c'}
export default new HttpRequest();

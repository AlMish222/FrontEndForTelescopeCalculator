/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ModelsStar {
  dec?: number;
  description?: string;
  imageURL?: string;
  isActive?: boolean;
  /** связь многие-ко-многим через telescope_observation_stars */
  observations?: ModelsTelescopeObservation[];
  ra?: number;
  shortDescription?: string;
  starID?: number;
  starName?: string;
}

export interface ModelsTelescopeObservation {
  completionDate?: string;
  createdAt?: string;
  creator?: ModelsUser;
  creatorID?: number;
  formationDate?: string;
  moderator?: ModelsUser;
  moderatorID?: number;
  observationDate?: string;
  observerLatitude?: number;
  observerLongitude?: number;
  stars?: ModelsStar[];
  status?: string;
  telescopeObservationID?: number;
  telescopeObservationStars?: ModelsTelescopeObservationStar[];
}

export interface ModelsTelescopeObservationStar {
  orderNumber?: number;
  quantity?: number;
  resultValue?: number;
  star?: ModelsStar;
  starID?: number;
  telescopeObservation?: ModelsTelescopeObservation;
  telescopeObservationID?: number;
}

export interface ModelsUser {
  isModerator?: boolean;
  passwordHash?: string;
  userID?: number;
  username?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Calculator Observations Stars API
 * @version 1.0
 * @contact
 *
 * Система позволяет пользователям создавать заявки на получение данных для расчёта наведения телескопа,
 * а модераторам — управлять этими заявками и добавлять новые звёзды.
 * ## 🔐 Аутентификация
 * - Используются **сессии и cookie**, хранящиеся в **Redis**.
 * - Без авторизации доступны только методы **чтения (GET)**.
 * - Для авторизованных запросов браузер автоматически отправляет cookie.
 * ## 👥 Роли и права доступа
 * - **Гость:** только GET-запросы.
 * - **Пользователь:** управление своими заявками + чтение данных.
 * - **Модератор:** полный доступ ко всем ресурсам.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  stars = {
    /**
     * @description Возвращает список звёзд, доступных для наблюдения. Можно указать фильтр по названию.
     *
     * @tags Stars
     * @name StarsList
     * @summary Получить список звёзд
     * @request GET:/stars
     */
    starsList: (
      query?: {
        /** Фильтр по названию звезды */
        star_name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ModelsStar[], Record<string, string>>({
        path: `/stars`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Создаёт новую запись звезды в базе данных
     *
     * @tags Stars
     * @name StarsCreate
     * @summary Добавить новую звезду
     * @request POST:/stars
     */
    starsCreate: (star: ModelsStar, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/stars`,
        method: "POST",
        body: star,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию о конкретной звезде по её ID
     *
     * @tags Stars
     * @name StarsDetail
     * @summary Получить звезду по ID
     * @request GET:/stars/{id}
     */
    starsDetail: (id: number, params: RequestParams = {}) =>
      this.request<ModelsStar, Record<string, string>>({
        path: `/stars/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет информацию о звезде по ID
     *
     * @tags Stars
     * @name StarsUpdate
     * @summary Обновить данные звезды
     * @request PUT:/stars/{id}
     */
    starsUpdate: (id: number, star: ModelsStar, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/stars/${id}`,
        method: "PUT",
        body: star,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет звезду по ID
     *
     * @tags Stars
     * @name StarsDelete
     * @summary Удалить звезду
     * @request DELETE:/stars/{id}
     */
    starsDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/stars/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет звезду в текущую заявку пользователя (черновик). Если уже есть — увеличивает количество.
     *
     * @tags Stars
     * @name PostStars
     * @summary Добавить звезду в черновик заявки
     * @request POST:/stars/{id}/add
     */
    postStars: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/stars/${id}/add`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Загружает изображение звезды в MinIO и сохраняет путь в БД
     *
     * @tags Stars
     * @name ImageCreate
     * @summary Загрузить изображение звезды
     * @request POST:/stars/{id}/image
     */
    imageCreate: (
      id: number,
      data: {
        /** Файл изображения */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/stars/${id}/image`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  telescopeObservationStars = {
    /**
     * @description Обновляет поля услуги в заявке (order_number, quantity, result_value)
     *
     * @tags TelescopeObservationStars
     * @name TelescopeObservationStarsUpdate
     * @request PUT:/telescope-observation-stars
     * @secure
     */
    telescopeObservationStarsUpdate: (
      input: Record<string, any>,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/telescope-observation-stars`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет связь звезды с наблюдением (услугу)
     *
     * @tags TelescopeObservationStars
     * @name TelescopeObservationStarsDelete
     * @summary Удалить услугу из заявки
     * @request DELETE:/telescope-observation-stars
     * @secure
     */
    telescopeObservationStarsDelete: (
      query: {
        /** ID заявки */
        telescope_observation_id: number;
        /** ID звезды */
        star_id: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/telescope-observation-stars`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  telescopeObservations = {
    /**
     * @description Возвращает список всех заявок (с фильтрацией по дате и статусу)
     *
     * @tags TelescopeObservations
     * @name TelescopeObservationsList
     * @summary Получить все заявки
     * @request GET:/telescopeObservations
     * @secure
     */
    telescopeObservationsList: (
      query?: {
        /** Дата начала (YYYY-MM-DD) */
        from?: string;
        /** Дата конца (YYYY-MM-DD) */
        to?: string;
        /** Статус заявки */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ModelsTelescopeObservation[], Record<string, string>>({
        path: `/telescopeObservations`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает черновик заявки и количество услуг в нём
     *
     * @tags TelescopeObservations
     * @name CartList
     * @summary Получить информацию о корзине пользователя
     * @request GET:/telescopeObservations/cart
     * @secure
     */
    cartList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/telescopeObservations/cart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает данные конкретной заявки со связанными звёздами и пользователями
     *
     * @tags TelescopeObservations
     * @name TelescopeObservationsDetail
     * @summary Получить заявку по ID
     * @request GET:/telescopeObservations/{id}
     * @secure
     */
    telescopeObservationsDetail: (id: number, params: RequestParams = {}) =>
      this.request<ModelsTelescopeObservation, Record<string, string>>({
        path: `/telescopeObservations/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет произвольные поля заявки (кроме ID и связей)
     *
     * @tags TelescopeObservations
     * @name TelescopeObservationsUpdate
     * @summary Обновить поля заявки
     * @request PUT:/telescopeObservations/{id}
     * @secure
     */
    telescopeObservationsUpdate: (
      id: number,
      input: Record<string, any>,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/telescopeObservations/${id}`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Доступно только модератору. Помечает заявку как удалённую
     *
     * @tags TelescopeObservations
     * @name TelescopeObservationsDelete
     * @summary Удалить заявку
     * @request DELETE:/telescopeObservations/{id}
     * @secure
     */
    telescopeObservationsDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/telescopeObservations/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Доступно только модератору. Завершает или отклоняет сформированную заявку
     *
     * @tags TelescopeObservations
     * @name CompleteUpdate
     * @summary Завершить или отклонить заявку
     * @request PUT:/telescopeObservations/{id}/complete
     * @secure
     */
    completeUpdate: (
      id: number,
      input: Record<string, string>,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/telescopeObservations/${id}/complete`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит заявку из состояния 'черновик' в 'сформирован'
     *
     * @tags TelescopeObservations
     * @name SubmitUpdate
     * @summary Сформировать заявку
     * @request PUT:/telescopeObservations/{id}/submit
     * @secure
     */
    submitUpdate: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/telescopeObservations/${id}/submit`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Логин пользователя и получение токена авторизации
     *
     * @tags Users
     * @name LoginCreate
     * @summary Авторизация пользователя
     * @request POST:/users/login
     */
    loginCreate: (
      credentials: {
        Password?: string;
        Username?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/users/login`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет текущую сессию пользователя и очищает cookie
     *
     * @tags Users
     * @name LogoutCreate
     * @summary Выход пользователя
     * @request POST:/users/logout
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, any>({
        path: `/users/logout`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает ID, имя пользователя и флаг модератора для авторизованного пользователя
     *
     * @tags Users
     * @name GetUsers
     * @summary Получить информацию о текущем пользователе
     * @request GET:/users/me
     * @secure
     */
    getUsers: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/users/me`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Позволяет обновить имя пользователя или пароль. Флаги модератора и ID недоступны для изменения
     *
     * @tags Users
     * @name PutUsers
     * @summary Обновление информации о текущем пользователе
     * @request PUT:/users/me
     * @secure
     */
    putUsers: (user: object, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/users/me`,
        method: "PUT",
        body: user,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Создает нового пользователя с логином, паролем и флагом модератора
     *
     * @tags Users
     * @name RegisterCreate
     * @summary Регистрация пользователя
     * @request POST:/users/register
     */
    registerCreate: (
      user: {
        IsModerator?: boolean;
        Password?: string;
        Username?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/users/register`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}

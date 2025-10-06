// hooks/usePost.ts
import { useMutation, UseMutationResult } from 'react-query';
import axiosInstance from '../services/axiosInstance';

export interface IParams {
  url: string;
  payload?: unknown;
}

export interface IMutationOptions {
  onSuccess?: (data: unknown, variables: IParams) => void;
  onError?: (error: unknown, variables: IParams) => void;
}

const post = async <TResponse>({ url, payload }: IParams): Promise<TResponse> => {
  const { data } = await axiosInstance.post<TResponse>(url, payload);
  return data;
};

// expose generic hook
function usePost<TResponse = unknown>(
  options?: IMutationOptions,
): UseMutationResult<TResponse, unknown, IParams, unknown> {
  return useMutation<TResponse, unknown, IParams, unknown>(post, {
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export default usePost;

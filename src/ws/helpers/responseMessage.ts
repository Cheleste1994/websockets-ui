type PropsResponseMessage<T> = {
  type: string;
  data: T;
};

export const responseMessage = <T>({
  data,
  type,
}: PropsResponseMessage<T>): string => {
  const dataString = JSON.stringify(data);

  const responseTurn = JSON.stringify({
    type,
    data: dataString,
    id: 0,
  });

  return responseTurn;
};

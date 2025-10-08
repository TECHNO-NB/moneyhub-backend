export interface ffOrderTypes {
  userId: String;
  ffUid: String;
  ffName: String;
  diamondPrice: Number;
  diamondTitle: String;
}


export interface messageType {
   notification: {
      title: string,
      body: string,
    },
    token: string,
}
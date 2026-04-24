export type Member = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export type Group = {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  memberNames: Record<string, string>;
  inviteCode: string;
  createdAt: string;
};

export type UserSettings = {
  userId: string;
  displayName: string;
  interests: string[];
};

export type Content = {
  id: string;
  title: string;
  summary: string;
  url?: string;
  source: "ai" | "member";
  postedBy?: { id: string; name: string; comment?: string };
  groupId: string;
  createdAt: string;
};

export type Answer = {
  memberId: string;
  memberName: string;
  memberImage?: string;
  text: string;
  submittedAt: string;
};

export type Feedback = {
  commonalities: string;
  differences: string;
  insights: string;
  nextQuestion: string;
};

export type ContentSession = {
  content: Content;
  question: string;
  answers: Answer[];
  feedback?: Feedback;
  nextQuestionAnswers?: Answer[];
};

import {SessionContext} from "../models/models";

export class SessionService {

  persistSessionContext = (context: SessionContext) => {
    localStorage.setItem(context.sessionId, JSON.stringify(context))
  }

  getSessionContext = (sessionId: string): SessionContext | null => {
    const sessionContext = localStorage.getItem(sessionId)
    return JSON.parse(sessionContext!)
  }

  removeSessionContext = (sessionId: string) => {
    localStorage.removeItem(sessionId)
  }
}
import { call, put, takeEvery, takeLatest } from "redux-saga/effects"

// Login Redux States
import { LOGIN_USER, LOGOUT_USER, SOCIAL_LOGIN } from "./actionTypes"
import { apiError, loginSuccess, logoutUserSuccess } from "./actions"

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper"
import {
  postLogin,
  postJwtLogin,
  postSocialLogin,
} from "../../../helpers/backend_helper"

const fireBaseBackend = getFirebaseBackend()

function* loginUser({ payload: { user, history } }) {
  try {
    const response = yield call(postLogin, {
      email: user.email,
      password: user.password,
    })

    localStorage.setItem("authUser", JSON.stringify(response.data))
    localStorage.setItem("user-token", response.token)

    yield put(loginSuccess(response))

    window.location.href = "/dashboard"
  } catch (error) {
    console.log("error", error.response.data.message)
    yield put(apiError(error.response.data.message))
  }
}

function* logoutUser({ payload: { history } }) {
  try {
    localStorage.removeItem("authUser")
    localStorage.removeItem("user-token")

    history.push("/login")
  } catch (error) {
    yield put(apiError(error))
  }
}

function* socialLogin({ payload: { data, history, type } }) {
  try {
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend()
      const response = yield call(fireBaseBackend.socialLoginUser, data, type)
      localStorage.setItem("authUser", JSON.stringify(response))
      yield put(loginSuccess(response))
    } else {
      const response = yield call(postSocialLogin, data)
      localStorage.setItem("authUser", JSON.stringify(response))
      yield put(loginSuccess(response))
    }
    history.push("/dashboard")
  } catch (error) {
    yield put(apiError(error))
  }
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, loginUser)
  yield takeLatest(SOCIAL_LOGIN, socialLogin)
  yield takeEvery(LOGOUT_USER, logoutUser)
}

export default authSaga

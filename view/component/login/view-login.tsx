import * as React from "react";

import styles = require("./view-login.less");

const ViewLogin: React.FunctionComponent = () => {
  // const onSignIn = async (googleUser: any) => {
  //   console.log(googleUser);
  // };

  return (
    <div className={styles["login"]}>
      <h2>Login</h2>
      <a href="/auth/google">Sign In with Google</a>
      {/* <GoogleLogin
        clientId="110184616480-aool6fignv26lonakn0epqkd1l10a4lu.apps.googleusercontent.com"
        onSuccess={onSignIn}
        onFailure={onSignIn}
        cookiePolicy={"single_host_origin"}
      /> */}
    </div>
  );
};

export { ViewLogin };

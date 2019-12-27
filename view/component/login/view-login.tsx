import * as React from "react";
import { GoogleLogin } from "react-google-login";

const styles = require("./view-login.less");

const ViewLogin = () => {
  const onSignIn = async (googleUser: any) => {
    
  };

  return (
    <div className={styles["login"]}>
      <h2>Log In</h2>
      <GoogleLogin
        clientId="110184616480-aool6fignv26lonakn0epqkd1l10a4lu.apps.googleusercontent.com"
        onSuccess={onSignIn}
        onFailure={onSignIn}
        cookiePolicy={"single_host_origin"}
      />
    </div>
  );
};

export { ViewLogin };

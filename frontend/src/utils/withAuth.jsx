// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom"

// const withAuth = (WrappedComponent ) => {
//   const AuthComponent = (props) => {
//     const navigate = useNavigate();

//     const isAuthenticated = () => {
//       if(localStorage.getItem("token")) {      // Check authentication status ( if Token is exist then "true")
//         return true;
//       } 
//       return false;
//     }

//     useEffect(() => {                // Redirect if not authenticated
//       if(!isAuthenticated()) {
//         navigate("/auth")
//       }
//     }, [])

//     return <WrappedComponent {...props} />     // Renders wrapped component if authenticated
//   }
//   return AuthComponent;
// }

// export default withAuth;





import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Higher-Order Component for route protection
 * @param {React.Component} WrappedComponent - The component to protect
 * @returns {React.Component} Protected component
 */
const withAuth = (WrappedComponent) => {
  return function AuthComponent(props) {
    const navigate = useNavigate();

    // Check authentication status ( if Token is exist )
    const isAuthenticated = !!localStorage.getItem("token");

    // Redirect if not authenticated ( if token is not exist )
    useEffect(() => {
      if (!isAuthenticated) {
        navigate("/auth", { replace: true });
      }
    }, [isAuthenticated, navigate]);

    return isAuthenticated ? <WrappedComponent {...props} /> : null;    // if Token is exist then return it 
  };
};

export default withAuth;
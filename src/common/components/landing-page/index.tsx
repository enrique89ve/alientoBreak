import React, { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { getCommunity } from "../../api/bridge";
import defaults from "../../constants/defaults.json";
import { _t } from "../../i18n";


const LandingPage = (props: any) => {
  const { global, activeUser } = props;
  const [community, setCommunity] = useState("");


  useEffect(() => {

    getCommunity(global.hive_id).then((community) => {
      if (community) {
        setCommunity(community.title);
      }
    });


  }, []);

  return (
    <div
      className={global.isElectron ? "landing-wrapper pt-5" : "landing-wrapper"}
      id="landing-wrapper"
    >
      <div className="top-bg" />
      <div className="sections first-section">
        <div className="text-container text-center">
          <img
            src="/assets/aliento.png"
            style={{ marginBottom: "0.5rem" }}
            alt="Aliento.blog"
            width={380}
            height="auto"
          />
          <h1>Crea y publica en Aliento.blog</h1>
          <div className="d-flex flex-wrap justify-content-center align-items-center">
            <p className="mb-2 w-88">{_t("landing-page.what-is-ecency")}</p>
          </div>
          <Link to={`/trending/${global.hive_id}`}>
            <button className="get-started mx-auto">
              Explorar

            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

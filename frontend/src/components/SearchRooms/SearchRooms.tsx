import { useEffect, useState, useRef } from 'react';
import { Icon, Item, Label } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import {
  faSquareParking,
  faPaw,
  faTemperatureArrowUp,
  faBath,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

import axios from '../../api/axios';
import { Ad } from '../../models/Ad';

import { BASE_URL } from '../../utils/request';
import getRandomRoom from '../../utils/getRandomRoom';
import formatTimestamp from '../../utils/formatTimestamp';

import './SearchRoomsStyles.css';

const AD_URL = '/ads';
const IMG_URL = '/api/img/';

const regex = /[0-9]+/;

function searchRooms() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [srcImg, setSrcImg] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean>();

  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(AD_URL).then((response) => {
      console.log(response.data);
      setAds(response.data);
    });
  }, []);

  useEffect(() => {
    function activateSearch() {
      let scrollPosition = window.pageYOffset;
      if (scrollPosition > 200) {
        setSearch(true);
      } else if (scrollPosition < 10) {
        setSearch(false);
      }
    }
    window.addEventListener('scroll', activateSearch);
  });

  useEffect(() => {
    localStorage.getItem('accessToken') != null
      ? setAuthenticated(true)
      : setAuthenticated(false);
  });

  return (
    <>
      <div className={`search ${search && 'search-active'}`}>
        <a href="#ads">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search__icon" />
        </a>
        <input
          className="search__input"
          type="text"
          id="search"
          onChange={(e) => {
            {
              setQuery(e.target.value.toLowerCase());

              if (e.target.value.length > 0) {
                adRef.current?.scrollIntoView();
              } else {
                window.scrollTo(0, 0);
              }
            }
          }}
          placeholder=" Find my room ..."
        />
      </div>
      <div ref={adRef} id="ads"></div>
      <div className="ad-container">
        <Item.Group divided>
          {ads
            .filter(
              (ad) =>
                ad.room?.streetAddress.toLowerCase().includes(query) ||
                ad.room?.eirCode.toLowerCase().includes(query) ||
                ad.room?.roomType.toLowerCase().includes(query)
            )
            .map((ad) => {
              return (
                <>
                  <Item key={'ad_' + ad.id}>
                    <Item.Image
                      label
                      src={
                        ad.room?.roomImage?.id != undefined
                          ? BASE_URL + IMG_URL + ad.room?.roomImage?.id
                          : getRandomRoom()
                      }
                    />
                    <Item.Content>
                      <Item.Header as="a">
                        {ad.room?.streetAddress.replace(regex, '')}
                      </Item.Header>
                      <a
                        className={
                          ad.user.email != localStorage.getItem('username')
                            ? 'email'
                            : 'hidden'
                        }
                        href={
                          authenticated ? 'mailto:' + ad.user?.email : '/login'
                        }
                      >
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="envelopeIcon"
                        />
                      </a>
                      <a
                        className={
                          ad.user.email == localStorage.getItem('username')
                            ? 'delete'
                            : 'hidden'
                        }
                        // onClick={}
                      >
                        <FontAwesomeIcon
                          icon={faTrashCan}
                          className="trashCan"
                          onClick={async (e: {
                            preventDefault: () => void;
                          }) => {
                            e.preventDefault();

                            try {
                              const response = await axios.delete(
                                AD_URL + '/' + ad.id,
                                {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization:
                                      '' +
                                      localStorage.getItem('tokenType') +
                                      localStorage.getItem('accessToken'),
                                  },
                                }
                              );
                              window.location.reload();
                            } catch (err: unknown) {
                              // const error = err as AxiosError;
                              // if (error?.response?.status === 409) {
                              //   setErrorMsg('Email is already registred');
                              //   console.log('taken');
                              // } else {
                              //   setErrorMsg('Registration Failed');
                              //   console.log('failed');
                              // }
                              // errorRef.current?.focus();
                            }
                          }}
                        />
                      </a>
                      <Item.Meta>
                        <span>
                          <Icon name="euro sign" />
                          {ad.rent} / month &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {ad.billsIncluded ? (
                            <Label as="a" color="teal" size="small" horizontal>
                              Bills Included
                            </Label>
                          ) : (
                            <></>
                          )}
                        </span>
                      </Item.Meta>
                      <Item.Description>
                        {formatTimestamp(ad.createdAt)}
                      </Item.Description>
                      <Item.Extra>
                        <Label>{ad.room?.roomType}</Label>

                        {ad.room?.ensuiteBathroom ? (
                          <Label>
                            <FontAwesomeIcon icon={faBath} />
                            &nbsp;&nbsp;Ensuite Bathroom
                          </Label>
                        ) : (
                          <></>
                        )}
                        {ad.ownerOccupied ? (
                          <Label>Owner Ocuupied</Label>
                        ) : (
                          <></>
                        )}

                        {ad.parking ? (
                          <Label>
                            <FontAwesomeIcon icon={faSquareParking} />
                            &nbsp;&nbsp;Parking
                          </Label>
                        ) : (
                          <></>
                        )}

                        {ad.petAllowed ? (
                          <Label>
                            <FontAwesomeIcon icon={faPaw} />
                            &nbsp;&nbsp;Pet Allowed
                          </Label>
                        ) : (
                          <></>
                        )}

                        {ad.room.heating ? (
                          <Label>
                            <FontAwesomeIcon icon={faTemperatureArrowUp} />
                            &nbsp;&nbsp;Heating
                          </Label>
                        ) : (
                          <></>
                        )}

                        {ad.room?.carpeted ? <Label>Carpeted</Label> : <></>}

                        {ad.dishWasher ? <Label>Dishwasher</Label> : <></>}

                        {ad.dryer ? <Label>Dryer</Label> : <></>}
                      </Item.Extra>
                    </Item.Content>
                  </Item>
                </>
              );
            })}
        </Item.Group>
      </div>
    </>
  );
}

export default searchRooms;

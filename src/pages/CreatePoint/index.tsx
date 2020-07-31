import React, { useEffect, useState, useCallback, ChangeEvent, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import {Map, TileLayer, Marker} from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';

import api from '../../services/api';

import Input from '../../components/Input';
import Carousel from '../../components/Carousel';
import Dropzone from '../../components/Dropzone'

import './styles.css';

import logo from '../../assets/logo.svg';

interface ItemsProps{
  id: string;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

interface SubmitFormData {
  name: string;
  email: string;
  whatsapp: string;
}

const CreatePoint = () => {

  const [items, setItems] = useState<ItemsProps[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedUF, setSelectedUF] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

  const [showModal, setShowModal] = useState(false);

  const history = useHistory();

  const [modeCarousel, setModeCarousel] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;

      setInitialPosition([latitude, longitude]);
    })
  }, [])

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, [])

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);

      setUfs(ufInitials);
    })
  }, [])

  useEffect(() => {
    if (selectedUF !== '0') {
      axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
        const cityNames = response.data.map(city => city.nome);

        setCities(cityNames);
      })
    }
  }, [selectedUF])

  const handleSelectUF = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUF(event.target.value);
  }, [])

  const handleSelectCity = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  }, [])

  const handleMapClick = useCallback((event: LeafletMouseEvent) => {
    const {lat, lng} = event.latlng;

    setSelectedPosition([lat, lng]);
  }, [])

  const handleSubmit = useCallback(async (data: SubmitFormData) => {

    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('whatsapp', data.whatsapp);
    formData.append('uf', selectedUF);
    formData.append('city', selectedCity);
    formData.append('latitude', String(selectedPosition[0]));
    formData.append('longitude', String(selectedPosition[1]));
    formData.append('items', selectedItems.join(','));

    if (!selectedFile) {
      alert('Faltando a imagem');
      return;
    }
    formData.append('image', selectedFile);

    try {
      await api.post('points', formData);

      setShowModal(true);

      await new Promise(resolve => {
        setTimeout(resolve, 3000);
      })

      setShowModal(false)
      history.push('/');
    } catch (err) {
      alert('ERRO');
    }

  }, [selectedCity, selectedItems, selectedPosition, selectedUF, history, selectedFile])

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(val => val.includes(id) 
      ? val.filter(itemId => itemId !== id) 
        : [...val, id]);
  }, [])

  return(
    <>
      <div id='page-create-point' >
        <header>
          <img src={logo} alt='Ecoleta' />

          <Link to='/' >
            <FiArrowLeft/>
            Voltar para home
          </Link>
        </header>

        <Form onSubmit={handleSubmit} >
          <h1>Cadastro do <br/> ponto de coleta</h1>

          <Dropzone fileUpload={setSelectedFile} />

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <Input type="text" name="name" id="name" />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <Input type="email" name="email" id="email" />
              </div>
              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <Input type="text" name="whatsapp" id="whatsapp" />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>

            {!showModal && <Map center={initialPosition} zoom={16.25} onclick={handleMapClick} >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={selectedPosition} />
            </Map>}

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select 
                  name="uf" 
                  id="uf" 
                  value={selectedUF} 
                  onChange={handleSelectUF} 
                >
                  <option value="0">Selecione uma UF</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select 
                  name="city" 
                  id="city" 
                  value={selectedCity} 
                  onChange={handleSelectCity} 
                >
                  <option value="0">Selecione uma cidade</option>
                  {cities.map(city => (
                    <option key={city} value={city} >{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Itens de coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
            </legend>

            <div id='toggleContainer' >
              <div 
                id='toggle'
                className={modeCarousel ? 'on' : 'off'}
                onClick={() => setModeCarousel(val => !val)}
              >
                <div 
                  id='circle' 
                  className={modeCarousel ? 'on' : 'off'}  
                />
              </div>
            </div>

            {modeCarousel
              ? <Carousel
                  items={items}
                  selectedItems={selectedItems}
                  handleSelectItem={handleSelectItem}
                />
              : <ul className="items-grid">
                  {items.map(item => (
                    <li 
                      key={item.id}
                      onClick={() => handleSelectItem(item.id)}
                      className={selectedItems.includes(item.id) ? 'selected' : ''}  
                    >
                      <img 
                        src={item.image_url}
                        alt={item.title}
                      />
                      <span>{item.title}</span>
                    </li>
                  ))}       
                </ul>
            }
            
          </fieldset>

          <button type="submit">Cadastrar</button>
        </Form>
      </div>
 
      {showModal && 
        <div id='confirmation-modal'>
          <FiCheckCircle size={50} />
          <h1>Confirmado</h1>
        </div>
      }
    </>
  )
}

export default CreatePoint;
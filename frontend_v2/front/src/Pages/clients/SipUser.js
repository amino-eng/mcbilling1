"use client"

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Tabs, Tab, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner } from "react-bootstrap";
import { CSVLink } from "react-csv";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaSearch,
  FaDownload,
  FaPlusCircle,
  FaTrashAlt,
  FaPhoneAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaUserAlt,
  FaEllipsisV,
  FaExclamationCircle,
  FaQuestionCircle,
  FaFilter
} from "react-icons/fa";

const SIPUsers = () => {
  const [sipUsers, setSipUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    id_user: "",
    sippasswd: "",
    callerid: "",
    alias: "",
    name: "",
    disable: "no",
    codecs: [],
    host: "",
    sip_group: "",
    block_call_reg: "no",
    record_call: "no",
    techprefix: "",
    nat: "",
    directmedia: "no",
    qualify: "no",
    context: "",
    dtmfmode: "RFC2833",
    insecure: "no",
    deny: "",
    permit: "",
    type: "friend",
    allowtransfer: "no",
    fakeRing: "no",
    callLimit: 0,
    moh: "",
    addparameter: "",
    forwardType: "undefined",
    dial_timeout: 60,
    enableVoicemail: "no",
    email: "",
    password: "",
    voicemail_email: "",
    voicemail_password: "",
    accountcode: "",
    status: "",
    allow: "",
  });
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/admin/SIPUsers/nom")
      .then((res) => setUsers(res.data?.users || []))
      .catch((err) => {
        console.log(err);
        setUsers([]);
      });
  };

  const fetchSIPUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/SIPUsers/affiche");
      setSipUsers(response.data?.sipUsers || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSipUsers([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/SIPUsers/delete/${id}`);
        fetchSIPUsers();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const handleEdit = async (user) => {
    setEditingId(user.id);
    setIsLoading(true);
    try {
      setFormData({
        id_user: user.id_user || "",
        name: user.name || "",
        accountcode: user.accountcode,
        host: user.host,
        status: user.status || "",
        allow: user.allow || "",
        sippasswd: user.secret || "",
        callerid: user.callerid || "",
        alias: user.alias || "",
        disable: user.disable || "no",
        codecs: user.codecs ? user.codecs.split(",") : [],
        sip_group: user.sip_group || "",
        block_call_reg: user.block_call_reg || "no",
        record_call: user.record_call || "no",
        techprefix: user.techprefix || "",
        nat: user.nat || "",
        directmedia: user.directmedia || "no",
        qualify: user.qualify || "no",
        context: user.context || "",
        dtmfmode: user.dtmfmode || "RFC2833",
        insecure: user.insecure || "no",
        deny: user.deny || "",
        permit: user.permit || "",
        type: user.type || "friend",
        allowtransfer: user.allowtransfer || "no",
        fakeRing: user.fakeRing || "no",
        callLimit: user.callLimit || 0,
        moh: user.moh || "",
        addparameter: user.addparameter || "",
        forwardType: user.forwardType || "undefined",
        dial_timeout: user.dial_timeout || 60,
        enableVoicemail: user.enableVoicemail || "no",
        email: user.email || "",
        password: user.secret || "",
        voicemail_email: user.voicemail_email || "",
        voicemail_password: user.voicemail_password || "",
      });
      setShowEdit(true);
    } catch (error) {
      console.error("Error preparing edit form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_user: "",
      sippasswd: "",
      callerid: "",
      alias: "",
      name: "",
      disable: "no",
      codecs: [],
      host: "",
      sip_group: "",
      block_call_reg: "no",
      record_call: "no",
      techprefix: "",
      nat: "",
      directmedia: "no",
      qualify: "no",
      context: "",
      dtmfmode: "RFC2833",
      insecure: "no",
      deny: "",
      permit: "",
      type: "friend",
      allowtransfer: "no",
      fakeRing: "no",
      callLimit: 0,
      moh: "",
      addparameter: "",
      forwardType: "undefined",
      dial_timeout: 60,
      enableVoicemail: "no",
      email: "",
      password: "",
      voicemail_email: "",
      voicemail_password: "",
      accountcode: "",
      status: "",
      allow: "",
    });
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => {
        const codecs = checked ? [...prev.codecs, value] : prev.codecs.filter((codec) => codec !== value);
        return { ...prev, codecs };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const requiredFields = ["id_user", "name", "accountcode", "host", "status"];
    // for (const field of requiredFields) {
    //   if (!formData[field] && formData[field] !== 0) {
    //     alert(`${field} is required!`);
    //     return;
    //   }
    // }
    
    const dataToSubmit = {
      id_user: selectedUser,
      name: formData.name,
      accountcode: formData.accountcode || "",
      host: formData.host,
      status: formData.status || "",
    };

    try {
      await axios.post("http://localhost:5000/api/admin/SIPUsers/ajouter", dataToSubmit);
      setShowAdd(false);
      resetForm();
      fetchSIPUsers();
    } catch (error) {
      console.error("Error adding data:", error.response ? error.response.data : error.message);
      alert(`Error: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/SIPUsers/modifier/${editingId}`, formData);
      setShowEdit(false);
      resetForm();
      fetchSIPUsers();
    } catch (error) {
      console.error("Error updating data:", error.response ? error.response.data : error.message);
      alert(`Error: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  const exportToCSV = () => {
    const csvRows = [];
    const headers = ["ID", "Nom", "Code de Compte", "Hôte", "Statut"];
    csvRows.push(headers.join(","));
    sipUsers.forEach((user) => {
      const row = [
        user.id_user,
        user.name,
        user.accountcode,
        user.host,
        user.status === 1 ? "unregistered" : user.status === 0 ? "unmonitored" : "unknown",
      ];
      csvRows.push(row.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "sip_users.csv");
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSIPUsers();
    fetchUsers();
  }, []);

  const filteredUsers = sipUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderForm = (isEdit = false) => (
    <Form onSubmit={isEdit ? handleUpdate : handleSubmit}>
      <Tabs defaultActiveKey="general" className="mb-3">
        <Tab eventKey="general" title="Général">
          <Form.Group>
            <Form.Label>ID Utilisateur</Form.Label>
            <select
              className="form-select"
              value={isEdit ? formData.id_user : selectedUser}
              onChange={(e) =>
                isEdit ? setFormData({ ...formData, id_user: e.target.value }) : setSelectedUser(e.target.value)
              }
            >
              <option value="">Sélectionnez l'utilisateur</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.accountcode}
                </option>
              ))}
            </select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Nom</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Label>Mot de passe</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlash /> : <Eye />}
              </Button>
            </div>
            {formData.password?.length > 0 &&
              (formData.password.length < 8 || formData.password.length > 12) && (
                <Form.Text className="text-danger">
                  Mot de passe doit être entre 8 et 12 caractères.
                </Form.Text>
              )}
          </Form.Group>
          <Form.Group>
            <Form.Label>SIP Mot de passe</Form.Label>
            <Form.Control type="text" name="sippasswd" value={formData.sippasswd} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>ID Appelant</Form.Label>
            <Form.Control type="text" name="callerid" value={formData.callerid} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Alias</Form.Label>
            <Form.Control type="text" name="alias" value={formData.alias} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Désactiver</Form.Label>
            <Form.Control as="select" name="disable" value={formData.disable} onChange={handleChange}>
              <option value="no">Non</option>
              <option value="all">Tout</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Codecs</Form.Label>
            <div className="row">
              {[
                "g729",
                "g726",
                "ulaw",
                "speex",
                "h264",
                "g723",
                "opus",
                "g722",
                "h263p",
                "vp8",
                "gsm",
                "alaw",
                "ilbc",
                "h263",
              ].map((codec) => (
                <div className="col-4" key={codec}>
                  <Form.Check
                    type="checkbox"
                    label={codec}
                    name="codecs"
                    value={formData.allow}
                    onChange={handleChange}
                    checked={formData.allow?.includes(codec)}
                  />
                </div>
              ))}
            </div>
          </Form.Group>
          <Form.Group>
            <Form.Label>Hôte</Form.Label>
            <Form.Control type="text" name="host" value={formData.host} onChange={handleChange} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Groupe SIP</Form.Label>
            <Form.Control
              type="text"
              name="sip_group"
              value={formData.sip_group}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Bloquer Enreg. Appel</Form.Label>
            <Form.Control as="select" name="block_call_reg" value={formData.block_call_reg} onChange={handleChange}>
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Enregistrer Appel</Form.Label>
            <Form.Control as="select" name="record_call" value={formData.record_call} onChange={handleChange}>
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Préfixe Technique</Form.Label>
            <Form.Control
              type="text"
              name="techprefix"
              value={formData.techprefix}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Tab>
        <Tab eventKey="nat" title="NAT">
          <Form.Group>
            <Form.Label>NAT</Form.Label>
            <Form.Control
              type="text"
              name="nat"
              value={formData.nat}
              onChange={handleChange}
              placeholder="force_rport,comedia"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Média Direct</Form.Label>
            <Form.Control as="select" name="directmedia" value={formData.directmedia} onChange={handleChange}>
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Qualifier</Form.Label>
            <Form.Control as="select" name="qualify" value={formData.qualify} onChange={handleChange}>
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </Form.Control>
          </Form.Group>
        </Tab>
        <Tab eventKey="additional" title="Additional">
          <Form.Group>
            <Form.Label>Contexte</Form.Label>
            <Form.Control type="text" name="context" value={formData.context} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Dtmfmode</Form.Label>
            <Form.Control as="select" name="dtmfmode" value={formData.dtmfmode} onChange={handleChange}>
              <option value="RFC2833">RFC2833</option>
              <option value="info">INFO</option>
              <option value="auto">AUTO</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Non Sécurisé</Form.Label>
            <Form.Control as="select" name="insecure" value={formData.insecure} onChange={handleChange}>
              <option value="no">Non</option>
              <option value="invite">Invite</option>
              <option value="port">Port</option>
              <option value="both">Both</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Refuser</Form.Label>
            <Form.Control
              type="text"
              name="deny"
              value={formData.deny}
              onChange={handleChange}
              placeholder="e.g., 0.0.0.0/0"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Permettre</Form.Label>
            <Form.Control
              type="text"
              name="permit"
              value={formData.permit}
              onChange={handleChange}
              placeholder="e.g., 192.168.1.0/24"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Form.Control as="select" name="type" value={formData.type} onChange={handleChange}>
              <option value="friend">Friend</option>
              <option value="peer">Peer</option>
              <option value="user">User</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Autoriser Transfert</Form.Label>
            <Form.Control as="select" name="allowtransfer" value={formData.allowtransfer} onChange={handleChange}>
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Fausse Sonnerie</Form.Label>
            <Form.Control as="select" name="fakeRing" value={formData.fakeRing} onChange={handleChange}>
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Limite d'Appel</Form.Label>
            <Form.Control type="number" name="callLimit" value={formData.callLimit} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>MOH</Form.Label>
            <Form.Control type="text" name="moh" value={formData.moh} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Paramètres Supplémentaires</Form.Label>
            <Form.Control type="text" name="addparameter" value={formData.addparameter} onChange={handleChange} />
          </Form.Group>
        </Tab>
        <Tab eventKey="forward" title="Forward">
          <Form.Group>
            <Form.Label>Type de Renvoi</Form.Label>
            <Form.Control as="select" name="forwardType" value={formData.forwardType} onChange={handleChange}>
              <option value="undefined">Undefined</option>
              <option value="fax">Fax</option>
              <option value="noanswer">No Answer</option>
              <option value="busy">Busy</option>
            </Form.Control>
          </Form.Group>
        </Tab>
        <Tab eventKey="voicemail" title="Messagerie Vocale">
          <Form.Group>
            <Form.Label>Activer la Messagerie Vocale</Form.Label>
            <Form.Control
              as="select"
              name="enableVoicemail"
              value={formData.enableVoicemail}
              onChange={handleChange}
            >
              <option value="no">Non</option>
              <option value="yes">Oui</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Voicemail Mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="voicemail_password"
              value={formData.voicemail_password}
              onChange={handleChange}
            />
          </Form.Group>
        </Tab>
      </Tabs>
      <div className="mt-3 text-center">
        <Button variant="secondary" onClick={() => (isEdit ? setShowEdit(false) : setShowAdd(false))}>
          Fermer
        </Button>
        <Button variant="primary" type="submit" className="ms-2">
          {isEdit ? "Mettre à jour" : "Soumettre"}
        </Button>
      </div>
    </Form>
  );

  // Clear messages after 3 seconds
  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 3000);
  };

  // Header Component
  const SIPUserHeader = () => {
    const csvData = [
      ["Nom", "Code de Compte", "Hôte", "Statut"],
      ...sipUsers.map((user) => [
        user.name,
        user.accountcode,
        user.host,
        user.status === 1 ? "unregistered" : user.status === 0 ? "unmonitored" : "unknown",
      ]),
    ];

    return (
      <Card.Header className="d-flex flex-wrap align-items-center p-0 rounded-top overflow-hidden">
        <div className="bg-primary p-3 w-100 position-relative shiny-header">
          <div className="position-absolute top-0 end-0 p-2 d-none d-md-block">
            {Array(5)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="floating-icon position-absolute"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  <FaUserAlt
                    className="text-white opacity-25"
                    style={{
                      fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                    }}
                  />
                </div>
              ))}
          </div>
          <div className="d-flex align-items-center position-relative z-2">
            <div className="bg-white rounded-circle p-3 me-3 shadow pulse-effect">
              <FaUserAlt className="text-primary fs-3" />
            </div>
            <div>
              <h2 className="fw-bold mb-0 text-white">Gestion des Utilisateurs SIP</h2>
              <p className="text-white-50 mb-0 d-none d-md-block">Gérez vos utilisateurs SIP facilement</p>
            </div>
          </div>
        </div>
        <div className="w-100 bg-white p-2 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <Badge bg="primary" className="d-flex align-items-center p-2 ps-3 rounded-pill">
              <span className="me-2 fw-normal">
                Total: <span className="fw-bold">{sipUsers.length}</span>
              </span>
              <span
                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "24px", height: "24px" }}
              >
                <FaUserAlt size={12} />
              </span>
            </Badge>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setShowAdd(true);
                resetForm();
              }}
              className="d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
            >
              <div className="icon-container">
                <FaPlusCircle />
              </div>
              <span>Ajouter un utilisateur SIP</span>
            </Button>
            <CSVLink
              data={csvData}
              filename={"sip_users.csv"}
              className="btn btn-success d-flex align-items-center gap-2 fw-semibold btn-hover-effect"
              onClick={() => setIsExporting(true)}
              onDownloaded={() => setIsExporting(false)}
            >
              <div className="icon-container">
                {isExporting ? <Spinner animation="border" size="sm" /> : <FaDownload />}
              </div>
              <span>{isExporting ? "Exportation en cours..." : "Exporter"}</span>
            </CSVLink>
          </div>
        </div>
      </Card.Header>
    );
  };

  // Search Bar Component
  const SearchBar = () => {
    return (
      <div className="position-relative mb-4">
        <Form.Control
          type="text"
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ps-4 shadow-sm border-0"
          style={{ height: "48px", borderRadius: "24px" }}
        />
        <FaSearch className="position-absolute text-muted" style={{ top: "16px", left: "16px" }} />
      </div>
    );
  };

  // Statut Badge Component
  const StatusBadge = ({ status }) => {
    if (status === 1) {
      return (
        <Badge bg="warning" pill className="px-3 py-2">
          <FaExclamationCircle className="me-1" /> Non enregistré
        </Badge>
      );
    } else if (status === 0) {
      return (
        <Badge bg="secondary" pill className="px-3 py-2">
          <FaTimesCircle className="me-1" /> Non surveillé
        </Badge>
      );
    } else {
      return (
        <Badge bg="info" pill className="px-3 py-2">
          <FaQuestionCircle className="me-1" /> Inconnu
        </Badge>
      );
    }
  };

  // Action Buttons Component
  const ActionButtons = ({ onEdit, onDelete }) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button variant="outline-primary" onClick={onEdit} size="sm" className="action-btn">
          <FaEdit className="btn-icon" />
        </Button>
        <Button variant="outline-danger" onClick={onDelete} size="sm" className="action-btn">
          <FaTrashAlt className="btn-icon" />
        </Button>
        <Dropdown align="end">
          <Dropdown.Toggle as={Button} variant="light" size="sm" className="p-1 action-btn">
            <FaEllipsisV className="btn-icon" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={onEdit}>Éditer</Dropdown.Item>
            <Dropdown.Item onClick={onDelete} className="text-danger">Supprimer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = () => {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
            <FaUserAlt className="text-muted" style={{ fontSize: "2rem" }} />
          </div>
        </div>
        <h5>Aucun utilisateur SIP trouvé</h5>
        <p className="text-muted">Ajoutez un nouvel utilisateur SIP ou modifiez votre recherche</p>
      </div>
    );
  };

  // Pagination Component
  const PaginationSection = () => {
    const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
    
    if (pageCount <= 1) return null;

    return (
      <div className="d-flex justify-content-center mt-4">
        <ReactPaginate
          previousLabel={"Précédent"}
          nextLabel={"Suivant"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={({ selected }) => paginate(selected + 1)}
          forcePage={currentPage - 1}
          containerClassName={"pagination mb-0"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
          activeClassName={"active"}
        />
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <style jsx="true">{`
        .dashboard-container {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .dashboard-main {
          transition: all 0.3s ease;
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .pulse-effect {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        .btn-hover-effect {
          transition: all 0.3s ease;
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .btn-icon {
          transition: transform 0.2s ease;
        }
        .action-btn:hover .btn-icon {
          transform: scale(1.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Table styles */
        .table {
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        }
        .table th, .table td, .table tr {
          border: none !important;
          position: relative;
          overflow: hidden;
        }
        
        /* Supprimer toutes les bordures Bootstrap */
        .table, .table * {
          border-collapse: collapse;
          border-spacing: 0;
          border: none !important;
          outline: none !important;
        }
        
        /* Supprimer les bordures de Bootstrap */
        .table-bordered,
        .table-bordered thead th,
        .table-bordered tbody + tbody,
        .table-bordered td,
        .table-bordered th,
        .table-bordered tr {
          border: 0 !important;
        }
        .table thead th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #212529;
          text-shadow: none;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }
        
        .table-header-bold thead th {
          padding-top: 15px;
          padding-bottom: 15px;
          position: relative;
        }
        
        .table-header-bold thead th::after {
          display: none;
        }
        .table-bordered tbody tr:hover {
          background: linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .table-bordered tbody tr:hover td {
          position: relative;
        }
        .table-bordered tbody tr:hover td::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          animation: shine 1.5s infinite;
        }
        @keyframes shine {
          100% {
            transform: translateX(100%);
          }
        }
        
        /* Shiny card effect */
        .shiny-card {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
          overflow: hidden;
        }
        
        .shiny-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg);
          animation: shineCard 6s infinite;
          pointer-events: none;
        }
        
        @keyframes shineCard {
          0% { transform: rotate(30deg) translateX(-100%); }
          20%, 100% { transform: rotate(30deg) translateX(100%); }
        }
        
        /* Button shine effects */
        .btn-hover-effect {
          position: relative;
          overflow: hidden;
        }
        
        .btn-hover-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg) translateX(-100%);
          transition: all 0.3s ease;
        }
        
        .btn-hover-effect:hover::after {
          transform: rotate(30deg) translateX(100%);
          transition: all 0.7s ease;
        }
        
        /* Shiny header effect */
        .shiny-header {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          position: relative;
          overflow: hidden;
        }
        
        .shiny-header::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-25deg);
          animation: shineHeader 5s infinite;
        }
        
        @keyframes shineHeader {
          0%, 100% { left: -100%; }
          50% { left: 100%; }
        }
        
        /* Badge shine effects */
        .badge {
          position: relative;
          overflow: hidden;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
          transition: all 0.3s ease;
        }
        
        .badge::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg) translateX(-100%);
          animation: shineBadge 3s infinite;
        }
        
        @keyframes shineBadge {
          0%, 100% { transform: rotate(30deg) translateX(-100%); }
          30%, 60% { transform: rotate(30deg) translateX(100%); }
        }
      `}</style>
      
      <div className="dashboard-main">
        <Container fluid className="px-4 py-4">
          <Row className="justify-content-center">
            <Col xs={12} lg={11}>
              <Card className="shadow-lg border-0 overflow-hidden main-card shiny-card">
                <SIPUserHeader />
                <Card.Body className="p-4" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
                  {error && (
                    <Alert variant="danger" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaTimesCircle className="me-2" />
                      {error}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert variant="success" className="d-flex align-items-center mb-4 shadow-sm">
                      <FaCheckCircle className="me-2" />
                      {successMessage}
                    </Alert>
                  )}

                  <Row className="mb-4">
                    <Col md={6} lg={4}>
                      <SearchBar />
                    </Col>
                  </Row>

                  <Card className="shadow-sm border-0">
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table hover className="mb-0 table-header-bold">
                          <thead className="bg-light text-dark">
                            <tr>
                              <th className="py-3 px-4 fw-bold">Nom</th>
                              <th className="py-3 px-4 fw-bold">Code de Compte</th>
                              <th className="py-3 px-4 fw-bold">Hôte</th>
                              <th className="py-3 px-4 text-center fw-bold">Statut</th>
                              <th className="py-3 px-4 text-center fw-bold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoading ? (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  <Spinner animation="border" variant="primary" />
                                  <p className="mt-3 text-muted">Chargement des données...</p>
                                </td>
                              </tr>
                            ) : currentUsers.length === 0 ? (
                              <tr>
                                <td colSpan="5">
                                  <EmptyState />
                                </td>
                              </tr>
                            ) : (
                              currentUsers.map((user) => (
                                <tr key={user.id}>
                                  <td className="py-3 px-4">{user.name}</td>
                                  <td className="py-3 px-4">{user.accountcode || <span className="text-muted fst-italic">Non spécifié</span>}</td>
                                  <td className="py-3 px-4">{user.host}</td>
                                  <td className="py-3 px-4 text-center">
                                    <StatusBadge status={user.status} />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <div className="d-flex gap-2 justify-content-center">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleEdit(user)}
                                        className="action-btn btn-hover-effect"
                                        title="Modifier"
                                      >
                                        <FaEdit className="btn-icon" />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(user.id)}
                                        className="action-btn btn-hover-effect"
                                        title="Supprimer"
                                      >
                                        <FaTrashAlt className="btn-icon" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
                    <div className="text-muted small">
                      {!isLoading && (
                        <>
                          <Badge bg="light" text="dark" className="me-2 shadow-sm">
                            <span className="fw-semibold">{currentUsers.length}</span> sur {filteredUsers.length} Utilisateurs SIP
                          </Badge>
                          {searchTerm && (
                            <Badge bg="light" text="dark" className="shadow-sm">
                              Filtré parmi {sipUsers.length} au total
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <PaginationSection />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Ajouter un utilisateur SIP Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered className="sip-user-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Ajouter un utilisateur SIP</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">{renderForm(false)}</Modal.Body>
      </Modal>
      
      {/* Modifier l'utilisateur SIP Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg" centered className="sip-user-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Modifier l'utilisateur SIP</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Chargement des données de l'utilisateur...</p>
            </div>
          ) : (
            renderForm(true)
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SIPUsers;
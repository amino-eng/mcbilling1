"use client"

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Tabs, Tab, Dropdown, Alert, Card, Container, Row, Col, Badge, Spinner, Toast, ToastContainer } from "react-bootstrap";
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
    callerid: "",
    alias: "",
    name: "",
    disable: "no",
    codecs: ['g729', 'ulaw', 'opus', 'gsm', 'alaw'],
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
    voicemail_email: "",
    voicemail_password: "",
    sippasswd: "",
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

  // Toast notifications state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Show toast notification
  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/admin/users/Users")
      .then((res) => {
        const users = res.data?.users || [];
        setUsers(users);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
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

  // Add delete function with toast notifications
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this SIP user?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/SIPUsers/delete/${id}`);
        fetchSIPUsers();
        showToastMessage("SIP user deleted successfully!");
      } catch (error) {
        console.error("Error deleting SIP user:", error);
        const errorMessage = error.response?.data?.error || error.message;
        showToastMessage(`Error: ${errorMessage}`, "danger");
      }
    }
  };

  const handleEdit = async (user) => {
    setEditingId(user.id);
    setIsLoading(true);
    try {
      // Fetch complete SIP user data from the backend
      const response = await axios.get(`http://localhost:5000/api/admin/SIPUsers/${user.id}/details`);
      const sipUser = response.data.sipUser;
      
      setFormData({
        id_user: sipUser.id_user || "",
        name: sipUser.name || "",
        accountcode: sipUser.accountcode || "",
        host: sipUser.host || "",
        status: sipUser.status?.toString() || "",
        allow: sipUser.allow || "",
        callerid: sipUser.callerid || "",
        alias: sipUser.alias || "",
        disable: sipUser.disable || "no",
        codecs: sipUser.codecs ? sipUser.codecs.split(",") : ['g729', 'ulaw', 'opus', 'gsm', 'alaw'],
        sip_group: sipUser.sip_group || "",
        block_call_reg: sipUser.block_call_reg || "no",
        record_call: sipUser.record_call || "no",
        techprefix: sipUser.techprefix || "",
        nat: sipUser.nat || "",
        directmedia: sipUser.directmedia || "no",
        qualify: sipUser.qualify || "no",
        context: sipUser.context || "",
        dtmfmode: sipUser.dtmfmode || "RFC2833",
        insecure: sipUser.insecure || "no",
        deny: sipUser.deny || "",
        permit: sipUser.permit || "",
        type: sipUser.type || "friend",
        allowtransfer: sipUser.allowtransfer || "no",
        fakeRing: sipUser.fakeRing || "no",
        callLimit: sipUser.callLimit || 0,
        moh: sipUser.moh || "",
        addparameter: sipUser.addparameter || "",
        forwardType: sipUser.forwardType || "undefined",
        dial_timeout: sipUser.dial_timeout || 60,
        enableVoicemail: sipUser.enableVoicemail || "no",
        email: sipUser.email || "",
        voicemail_email: sipUser.voicemail_email || "",
        voicemail_password: sipUser.voicemail_password || "",
        sippasswd: sipUser.sippasswd || "",
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
      callerid: "",
      alias: "",
      name: "",
      disable: "no",
      codecs: ['g729', 'ulaw', 'opus', 'gsm', 'alaw'],
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
      callerid: formData.callerid,
      alias: formData.alias,
      disable: formData.disable,
      codecs: formData.codecs.join(","),
      sip_group: formData.sip_group,
      block_call_reg: formData.block_call_reg,
      record_call: formData.record_call,
      techprefix: formData.techprefix,
      nat: formData.nat,
      directmedia: formData.directmedia,
      qualify: formData.qualify,
      context: formData.context,
      dtmfmode: formData.dtmfmode,
      insecure: formData.insecure,
      deny: formData.deny,
      permit: formData.permit,
      type: formData.type,
      allowtransfer: formData.allowtransfer,
      fakeRing: formData.fakeRing,
      callLimit: formData.callLimit,
      moh: formData.moh,
      addparameter: formData.addparameter,
      forwardType: formData.forwardType,
      dial_timeout: formData.dial_timeout,
      enableVoicemail: formData.enableVoicemail,
      email: formData.email,
      voicemail_email: formData.voicemail_email,
      voicemail_password: formData.voicemail_password,
      sippasswd: formData.sippasswd,
    };

    try {
      await axios.post("http://localhost:5000/api/admin/SIPUsers/ajouter", dataToSubmit);
      setShowAdd(false);
      resetForm();
      fetchSIPUsers();
      showToastMessage("SIP user added successfully!");
    } catch (error) {
      console.error("Error adding data:", error.response ? error.response.data : error.message);
      const errorMessage = error.response?.data?.error || error.message;
      showToastMessage(`Error: ${errorMessage}`, "danger");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending update request with data:", formData);
      const response = await axios.put(
        `http://localhost:5000/api/admin/SIPUsers/modifier/${editingId}`, 
        formData,
        { 
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true // This will prevent axios from throwing errors on HTTP error status
        }
      );
      
      console.log("Update response status:", response.status);
      console.log("Update response data:", response.data);
      
      if (response.status >= 200 && response.status < 300) {
        setShowEdit(false);
        resetForm();
        fetchSIPUsers();
        showToastMessage("SIP user updated successfully!");
      } else {
        console.error("Update failed with status", response.status, ":", response.data);
        // Show complete error details in alert
        const errorDetails = response.data?.details || {};
        showToastMessage(
          `Error: ${response.data?.error || 'Failed to update SIP user'}`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in handleUpdate:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      showToastMessage(
        `Error: ${error.response?.data?.error || error.message}`,
        "danger"
      );
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

  const renderForm = (isEdit = false) => {
    return (
      <>
        <Form onSubmit={isEdit ? handleUpdate : handleSubmit}>
          <Tabs defaultActiveKey="general" className="mb-3">
            <Tab eventKey="general" title="Général">
              <Form.Group>
                <Form.Label>User ID</Form.Label>
                <select
                  className="form-select"
                  value={isEdit ? formData.id_user : selectedUser}
                  onChange={(e) =>
                    isEdit ? setFormData({ ...formData, id_user: e.target.value }) : setSelectedUser(e.target.value)
                  }
                >
                  <option value="">Select a user</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.id})
                    </option>
                  ))}
                </select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
              </Form.Group>
              <Form.Group controlId="formPassword">
                <Form.Label>SIP Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="sippasswd"
                    value={formData.sippasswd}
                    onChange={handleChange}
                    required
                  />
                  <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeSlash /> : <Eye />}
                  </Button>
                </div>
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
                <Form.Label>Disable</Form.Label>
                <Form.Control as="select" name="disable" value={formData.disable} onChange={handleChange}>
                  <option value="no">No</option>
                  <option value="all">All</option>
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
                        value={codec}
                        onChange={handleChange}
                        checked={formData.codecs?.includes(codec)}
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
                <Form.Label>SIP Group</Form.Label>
                <Form.Control
                  type="text"
                  name="sip_group"
                  value={formData.sip_group}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Block Call Recording</Form.Label>
                <Form.Control as="select" name="block_call_reg" value={formData.block_call_reg} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Record Call</Form.Label>
                <Form.Control as="select" name="record_call" value={formData.record_call} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Technical Prefix</Form.Label>
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
                <Form.Label>Direct Media</Form.Label>
                <Form.Control as="select" name="directmedia" value={formData.directmedia} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Qualify</Form.Label>
                <Form.Control as="select" name="qualify" value={formData.qualify} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
            </Tab>
            <Tab eventKey="additional" title="Additional">
              <Form.Group>
                <Form.Label>Context</Form.Label>
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
                <Form.Label>Insecure</Form.Label>
                <Form.Control as="select" name="insecure" value={formData.insecure} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="invite">Invite</option>
                  <option value="port">Port</option>
                  <option value="both">Both</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Deny</Form.Label>
                <Form.Control type="text" name="deny" value={formData.deny} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Permit</Form.Label>
                <Form.Control type="text" name="permit" value={formData.permit} onChange={handleChange} />
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
                <Form.Label>Transfer Allowed</Form.Label>
                <Form.Control as="select" name="allowtransfer" value={formData.allowtransfer} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Fake Ring</Form.Label>
                <Form.Control as="select" name="fakeRing" value={formData.fakeRing} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Call Limit</Form.Label>
                <Form.Control type="number" name="callLimit" value={formData.callLimit} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Music on Hold</Form.Label>
                <Form.Control type="text" name="moh" value={formData.moh} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Additional Parameter</Form.Label>
                <Form.Control type="text" name="addparameter" value={formData.addparameter} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Forward Type</Form.Label>
                <Form.Control type="text" name="forwardType" value={formData.forwardType} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Call Timeout</Form.Label>
                <Form.Control type="number" name="dial_timeout" value={formData.dial_timeout} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Voicemail Enabled</Form.Label>
                <Form.Control as="select" name="enableVoicemail" value={formData.enableVoicemail} onChange={handleChange}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Voicemail Email</Form.Label>
                <Form.Control type="email" name="voicemail_email" value={formData.voicemail_email} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Voicemail Password</Form.Label>
                <Form.Control type="password" name="voicemail_password" value={formData.voicemail_password} onChange={handleChange} />
              </Form.Group>
            </Tab>
          </Tabs>
          <div className="d-flex justify-content-end mt-3">
            <Button variant="primary" type="submit">
              {isEdit ? "Update" : "Add"}
            </Button>
            <Button variant="secondary" onClick={() => isEdit ? setShowEdit(false) : setShowAdd(false)} className="ms-2">
              Cancel
            </Button>
          </div>
        </Form>
      </>
    );
  };

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
              <h2 className="fw-bold mb-0 text-white">SIP Users Management</h2>
              <p className="text-white-50 mb-0 d-none d-md-block">Manage your SIP users easily</p>
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
              <span>Add SIP User</span>
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
              <span>{isExporting ? "Exporting..." : "Export"}</span>
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
          placeholder="Search by name..."
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
          <FaExclamationCircle className="me-1" /> Not registered
        </Badge>
      );
    } else if (status === 0) {
      return (
        <Badge bg="secondary" pill className="px-3 py-2">
          <FaTimesCircle className="me-1" /> Unmonitored
        </Badge>
      );
    } else {
      return (
        <Badge bg="info" pill className="px-3 py-2">
          <FaQuestionCircle className="me-1" /> Unknown
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
            <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
            <Dropdown.Item onClick={onDelete} className="text-danger">Delete</Dropdown.Item>
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
        <h5>No SIP users found</h5>
        <p className="text-muted">Add a new SIP user or modify your search</p>
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
          previousLabel={"Previous"}
          nextLabel={"Next"}
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
                              <th className="py-3 px-4 fw-bold">Name</th>
                              <th className="py-3 px-4 fw-bold">Account Code</th>
                              <th className="py-3 px-4 fw-bold">Host</th>
                              <th className="py-3 px-4 text-center fw-bold">Status</th>
                              <th className="py-3 px-4 text-center fw-bold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoading ? (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  <Spinner animation="border" variant="primary" />
                                  <p className="mt-3 text-muted">Loading data...</p>
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
                                  <td className="py-3 px-4">
                                    <div className="d-flex flex-column">
                                      <div className="fw-medium">
                                        {user.accountcode ? (
                                          <span className="text-primary">{user.accountcode}</span>
                                        ) : (
                                          <span className="text-muted fst-italic">Not specified</span>
                                        )}
                                      </div>
                                      {user.id_user && (
                                        <div className="small text-muted">
                                          <span className="me-1">ID:</span>
                                          <span className="badge bg-light text-dark">{user.id_user}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
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
                                        title="Edit"
                                      >
                                        <FaEdit className="btn-icon" />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(user.id)}
                                        className="action-btn btn-hover-effect"
                                        title="Delete"
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
                            <span className="fw-semibold">{currentUsers.length}</span> of {filteredUsers.length} SIP Users
                          </Badge>
                          {searchTerm && (
                            <Badge bg="light" text="dark" className="shadow-sm">
                              Filtered from {sipUsers.length} total
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

      {/* Add SIP User Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered className="sip-user-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add SIP User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">{renderForm(false)}</Modal.Body>
      </Modal>
      
      {/* Edit SIP User Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg" centered className="sip-user-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Edit SIP User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading user data...</p>
            </div>
          ) : (
            renderForm(true)
          )}
        </Modal.Body>
      </Modal>

      {/* Toast Notifications */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1060,
          minWidth: '300px'
        }}
      >
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={5000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toastVariant === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'success' ? 'text-white' : 'text-white'}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default SIPUsers;
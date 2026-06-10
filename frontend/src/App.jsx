import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";
import { API_BASE_URL, SOCKET_URL } from "./config";

const socket = SOCKET_URL ? io(SOCKET_URL) : io();

function App() {
  const [message, setMessage] = useState("Hazir");
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedUserId: "",
  });


  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    projectId: "",
    assignedUserId: "",
  });


  const handleLoginChange = (event) => {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value,
    });
  };

  const handleTaskFormChange = (event) => {
    setTaskForm({
      ...taskForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleEditFormChange = (event) => {
    setEditForm({
      ...editForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Giris basarisiz");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setAuthLoading(false);
      setMessage("Giris basarili");

      setLoginData({
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage("Sunucuya baglanilamadi");
    }
  };

  const getProfile = async (currentToken = token) => {
    if (!currentToken) {
      setAuthLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem("token");
        setToken("");
        setCurrentUser(null);
        setTasks([]);
        setMessage(data.message || "Oturum gecersiz");
        setAuthLoading(false);
        return;
      }

      setCurrentUser(data.user);
    } catch (error) {
      setMessage("Profil bilgisi alinamadi");
    } finally {
      setAuthLoading(false);
    }
  };

  const getTasks = async (currentToken = token) => {
    if (!currentToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Tasklar getirilemedi");
        return;
      }

      setTasks(data.tasks);
    } catch (error) {
      setMessage("Tasklar alinamadi");
    }
  };

  const getProjects = async (currentToken = token) => {
    if (!currentToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Projeler getirilemedi");
        return;
      }

      setProjects(data.projects);
    } catch (error) {
      setMessage("Projeler alinamadi");
    }
  };

  const getUsers = async (currentToken = token) => {
    if (!currentToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/workload`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Kullanicilar getirilemedi");
        return;
      }

      setUsers(data.workload);
    } catch (error) {
      setMessage("Kullanici listesi alinamadi");
    }
  };

  const createTask = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          projectId: Number(taskForm.projectId),
          assignedUserId: taskForm.assignedUserId
            ? Number(taskForm.assignedUserId)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Task olusturulamadi");
        return;
      }

      setMessage("Task basariyla olusturuldu");

      setTaskForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        projectId: "",
        assignedUserId: "",
      });

      getTasks(token);
    } catch (error) {
      setMessage("Sunucuya baglanilamadi");
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "MEDIUM",
      assignedUserId: task.assignedUser?.id ? String(task.assignedUser.id) : "",
    });
  };
  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      assignedUserId: "",
    });
  };

  const getSummary = async (currentToken = token) => {
    if (!currentToken) return;


    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setSummary(data.summary);
    } catch (error) {
      console.log("summary alinamadi");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Task status guncellenemedi");
        return false;
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      setMessage("Task status guncellendi");
      return true;
    } catch (error) {
      setMessage("Sunucuya baglanilamadi");
      return false;
    }
  };
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const taskId = Number(draggableId);
    const task = tasks.find((item) => item.id === taskId);

    if (!task) return;


    if (!canDragTask(task)) {
      setMessage("Bu taski tasima yetkin yok");
      return;
    }

    const newStatus = destination.droppableId;

    await updateTaskStatus(taskId, newStatus);
  };

  const updateTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          priority: editForm.priority,
          assignedUserId: editForm.assignedUserId
            ? Number(editForm.assignedUserId)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Task guncellenemedi");
        return;
      }

      setMessage("Task guncellendi");
      setEditingTaskId(null);

      if (isManager) {
        getSummary(token);
      }
    } catch (error) {
      setMessage("Sunucuya baglanilamadi");
    }
  };

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm("Bu task silinsin mi?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Task silinemedi");
        return;
      }

      setMessage("Task silindi");

      if (isManager) {
        getSummary(token);
      }
    } catch (error) {
      setMessage("Sunucuya baglanilamadi");
    }
  };

  useEffect(() => {
    if (token) {
      getProfile(token);
      getTasks(token);
      getProjects(token);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !currentUser) return;

    if (currentUser.role === "MANAGER") {
      getSummary(token);
      getUsers(token);
    } else {
      setSummary(null);
      setUsers([]);
    }
  }, [token, currentUser]);



    useEffect(() => {
      if (!token) {
        setAuthLoading(false);
      }
    }, [token]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("socket baglandi", socket.id);
    });

    socket.on("taskStatusUpdated", (data) => {
      setMessage(data.message);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === data.task.id ? { ...task, ...data.task } : task
        )
      );
      if (currentUser?.role === "MANAGER") {
        getSummary(token);
      }

    });

    socket.on("taskCreated", (data) => {
      setMessage(data.message);
      setTasks((prevTasks) => [data.task, ...prevTasks]);
      if (currentUser?.role === "MANAGER") {
        getSummary(token);
      }

    });

    socket.on("taskUpdated", (data) => {
      setMessage(data.message);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === data.task.id ? data.task : task
        )
      );
      if (currentUser?.role === "MANAGER") {
        getSummary(token);
      }

    });

    socket.on("taskDeleted", (data) => {
      setMessage(data.message);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== data.taskId)
      );
      if (currentUser?.role === "MANAGER") {
        getSummary(token);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("taskStatusUpdated");
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, [token]);

  const todoTasks = useMemo(
    () => tasks.filter((task) => task.status === "TODO"),
    [tasks]
  );

  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.status === "IN_PROGRESS"),
    [tasks]
  );

  const doneTasks = useMemo(
    () => tasks.filter((task) => task.status === "DONE"),
    [tasks]
  );

  const columns = [
    { id: "TODO", title: "Yapilacak" },
    { id: "IN_PROGRESS", title: "Yapiliyor" },
    { id: "DONE", title: "Tamamlandi" },
  ];
  const isManager = currentUser?.role === "MANAGER";


  const canDragTask = (task) => {
    if (isManager) return true;
    if (!currentUser) return false;

    return task.assignedUser?.id === currentUser.id;
  };

  if (authLoading) {
    return (
      <div className="page">
        <div className="container">
          <h1>Team Task Portal</h1>
          <p className="status">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <span className="hero-badge">REACT + NODE + PRISMA + SOCKET</span>
          <h1>Team Task Portal</h1>
          <p className="hero-text">
            Ekip içi görev yönetimi, canlı durum güncellemesi ve dashboard takibi.
          </p>
        </div>

        <div className="status-card">
          <span className="status-title">Durum</span>
          <p>{message}</p>
        </div>

        {!token ? (
          <form className="panel auth-panel" onSubmit={handleLogin}>
            <h2>Giris Yap</h2>

            <input
              type="email"
              name="email"
              placeholder="E-posta"
              value={loginData.email}
              onChange={handleLoginChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Sifre"
              value={loginData.password}
              onChange={handleLoginChange}
            />

            <button type="submit">Giris Yap</button>
          </form>
        ) : (
          <>

            <div className="role-box">
              <span className={`role-badge ${isManager ? "manager" : "member"}`}>
                {currentUser?.role}
              </span>
              <p className="role-text">
                {isManager
                  ? "Yonetici olarak tum tasklari yonetebilirsin."
                  : "Ekip uyesi olarak sadece kendi tasklarini hareket ettirebilirsin."}
              </p>
            </div>
            {isManager && (
            <div className="summary-grid">
              <div className="summary-card">
                <span>Toplam Proje</span>
                <strong>{summary?.totalProjects ?? 0}</strong>
              </div>

              <div className="summary-card">
                <span>Toplam Task</span>
                <strong>{summary?.totalTask ?? 0}</strong>
              </div>

              <div className="summary-card">
                <span>Yapiliyor</span>
                <strong>{summary?.inProgressTask ?? 0}</strong>
              </div>

              <div className="summary-card">
                <span>Tamamlama</span>
                <strong>%{summary?.comlationRate ?? 0}</strong>
              </div>
            </div>
            )}
            {isManager && (
              <div className="card">
                <h2>Yeni Task Ekle</h2>

                <form className="task-form-grid" onSubmit={createTask}>
                  <input
                    type="text"
                    name="title"
                    placeholder="Task basligi"
                    value={taskForm.title}
                    onChange={handleTaskFormChange}
                  />

                  <input
                    type="text"
                    name="description"
                    placeholder="Aciklama"
                    value={taskForm.description}
                    onChange={handleTaskFormChange}
                  />

                  <select
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleTaskFormChange}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>

                  <select
                    name="projectId"
                    value={taskForm.projectId}
                    onChange={handleTaskFormChange}
                  >
                    <option value="">Proje sec</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>

                  <select
                    name="assignedUserId"
                    value={taskForm.assignedUserId}
                    onChange={handleTaskFormChange}
                  >
                    <option value="">Kullanici sec</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.role}
                      </option>
                    ))}
                  </select>

                  <button type="submit">Task Olustur</button>
                </form>
              </div>
            )}
            <div className="panel board-panel">
              <div className="panel-header">
                <div>
                  <h2>Gorev Panosu</h2>
                  <p>Socket ile gelen task guncellemeleri anlik yansir.</p>
                </div>

                <button
                  className="logout-button"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setToken("");
                    setTasks([]);
                    setCurrentUser(null);
                    setAuthLoading(false);
                    setSummary(null);
                    setMessage("Cikis yapildi");
                  }}
                >
                  Cikis Yap
                </button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="board-grid">
                  {columns.map((column) => {
                    const columnTasks = tasks.filter((task) => task.status === column.id);

                    return (
                      <Droppable droppableId={column.id} key={column.id}>
                        {(provided, snapshot) => (
                          <div
                            className={`board-column ${
                              snapshot.isDraggingOver ? "drag-over" : ""
                            }`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <div className="board-column-header">
                              <h3>{column.title}</h3>
                              <span>{columnTasks.length}</span>
                            </div>

                            <div className="board-column-body">
                              {columnTasks.length === 0 && (
                                <p className="empty-text">Bu kolonda task yok</p>
                              )}

                              {columnTasks.map((task, index) => (
                                <Draggable
                                  key={task.id.toString()}
                                  draggableId={task.id.toString()}
                                  index={index}
                                  isDragDisabled={!canDragTask(task)}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      className={`task-card ${
                                        snapshot.isDragging ? "dragging" : ""
                                      } ${!canDragTask(task) ? "drag-disabled" : ""}`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <h4>{task.title}</h4>

                                      <p>
                                        <strong>Aciklama:</strong> {task.description || "-"}
                                      </p>

                                      <p>
                                        <strong>Oncelik:</strong> {task.priority}
                                      </p>

                                      <p>
                                        <strong>Proje:</strong> {task.project?.title || "-"}
                                      </p>

                                      <p>
                                        <strong>Atanan:</strong>{" "}
                                        {task.assignedUser ? task.assignedUser.name : "Yok"}
                                      </p>

                                      {isManager && (
                                        <div className="task-actions">
                                          <button
                                            type="button"
                                            className="edit-button"
                                            onClick={() => startEditTask(task)}
                                          >
                                            Duzenle
                                          </button>

                                          <button
                                            type="button"
                                            className="delete-button"
                                            onClick={() => deleteTask(task.id)}
                                          >
                                            Sil
                                          </button>
                                        </div>
                                      )}

                                      {editingTaskId === task.id && (
                                        <div className="edit-box">
                                          <input
                                            type="text"
                                            name="title"
                                            placeholder="Task basligi"
                                            value={editForm.title}
                                            onChange={handleEditFormChange}
                                          />

                                          <input
                                            type="text"
                                            name="description"
                                            placeholder="Aciklama"
                                            value={editForm.description}
                                            onChange={handleEditFormChange}
                                          />

                                          <select
                                            name="priority"
                                            value={editForm.priority}
                                            onChange={handleEditFormChange}
                                          >
                                            <option value="LOW">LOW</option>
                                            <option value="MEDIUM">MEDIUM</option>
                                            <option value="HIGH">HIGH</option>
                                          </select>

                                          <select
                                            name="assignedUserId"
                                            value={editForm.assignedUserId}
                                            onChange={handleEditFormChange}
                                          >
                                            <option value="">Kullanici sec</option>
                                            {users.map((user) => (
                                              <option key={user.id} value={user.id}>
                                                {user.name} - {user.role}
                                              </option>
                                            ))}
                                          </select>

                                          <div className="edit-actions">
                                            <button type="button" onClick={() => updateTask(task.id)}>
                                              Kaydet
                                            </button>
                                            <button type="button" onClick={cancelEditTask}>
                                              Iptal
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}

                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              </DragDropContext>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

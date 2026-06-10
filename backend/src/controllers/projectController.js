const prisma = require("../config/prisma");

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Proje basligi zorunludur",
      });
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: req.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Proje basariyla olusturuldu",
      project: newProject,
    });
  } catch (error) {
    console.error("createProject hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Projeler getirildi",
      projects,
    });
  } catch (error) {
    console.error("getProjects hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { title, description } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Proje bulunamadi",
      });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        title: title ?? existingProject.title,
        description: description ?? existingProject.description,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Proje basariyla guncellendi",
      project: updatedProject,
    });
  } catch (error) {
    console.error("updateProject hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Proje bulunamadi",
      });
    }

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return res.status(200).json({
      message: "Proje basariyla silindi",
    });
  } catch (error) {
    console.error("deleteProject hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject
};

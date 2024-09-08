interface Education {
    institution: string;
    degree: string;
    year: string;
}

interface WorkExperience {
    company: string;
    position: string;
    duration: string;
}

interface ResumeData {
    username: string;
    name: string;
    email: string;
    phone: string;
    education: Education[];
    workExperience: WorkExperience[];
    skills: string[];
}

class ResumeBuilder {
    private form: HTMLFormElement;
    private resumeDisplay: HTMLElement;
    private data: ResumeData;
    private generateLinkButton: HTMLButtonElement;
    private shareableLinkInput: HTMLInputElement;
    private downloadPDFButton: HTMLButtonElement;

    constructor() {
        this.form = document.getElementById('resumeForm') as HTMLFormElement;
        this.resumeDisplay = document.getElementById('resumeDisplay') as HTMLElement;
        this.generateLinkButton = document.getElementById('generateLink') as HTMLButtonElement;
        this.shareableLinkInput = document.getElementById('shareableLink') as HTMLInputElement;
        this.downloadPDFButton = document.getElementById('downloadPDF') as HTMLButtonElement;
        this.data = this.getEmptyResumeData();

        this.initializeEventListeners();
        this.loadResumeFromURL();
    }

    private getEmptyResumeData(): ResumeData {
        return {
            username: '',
            name: '',
            email: '',
            phone: '',
            education: [],
            workExperience: [],
            skills: []
        };
    }

    private initializeEventListeners(): void {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        document.getElementById('addEducation')?.addEventListener('click', this.addEducationField.bind(this));
        document.getElementById('addWork')?.addEventListener('click', this.addWorkField.bind(this));
        document.getElementById('addSkill')?.addEventListener('click', this.addSkillField.bind(this));
        this.form.addEventListener('input', this.updateResume.bind(this));
        this.resumeDisplay.addEventListener('click', this.handleResumeClick.bind(this));
        this.generateLinkButton.addEventListener('click', this.generateShareableLink.bind(this));
        this.downloadPDFButton.addEventListener('click', this.downloadPDF.bind(this));
    }

    private handleSubmit(e: Event): void {
        e.preventDefault();
        this.updateResume();
        this.saveResume();
    }

    private updateResume(): void {
        this.collectFormData();
        this.renderResume();
    }

    private collectFormData(): void {
        const formData = new FormData(this.form);
        
        this.data.username = formData.get('username') as string;
        this.data.name = formData.get('name') as string;
        this.data.email = formData.get('email') as string;
        this.data.phone = formData.get('phone') as string;

        this.data.education = this.collectMultipleFields('education-entry');
        this.data.workExperience = this.collectMultipleFields('work-entry');
        this.data.skills = Array.from(formData.getAll('skill') as string[]);
    }

    private collectMultipleFields(className: string): any[] {
        return Array.from(this.form.getElementsByClassName(className)).map(entry => {
            const inputs = entry.getElementsByTagName('input');
            return Array.from(inputs).reduce((obj: any, input) => {
                obj[input.classList[0]] = input.value;
                return obj;
            }, {});
        });
    }

    private renderResume(): void {
        document.getElementById('resumeName')!.textContent = this.data.name;
        document.getElementById('resumeEmail')!.textContent = this.data.email;
        document.getElementById('resumePhone')!.textContent = this.data.phone;

        this.renderEducation();
        this.renderWorkExperience();
        this.renderSkills();
    }

    private renderEducation(): void {
        const educationContainer = document.getElementById('resumeEducation')!;
        educationContainer.innerHTML = this.data.education.map((edu, index) => `
            <div class="editable" data-type="education" data-index="${index}">
                <p><strong>${edu.institution}</strong></p>
                <p>${edu.degree}</p>
                <p>${edu.year}</p>
            </div>
        `).join('');
    }

    private renderWorkExperience(): void {
        const workContainer = document.getElementById('resumeWork')!;
        workContainer.innerHTML = this.data.workExperience.map((work, index) => `
            <div class="editable" data-type="work" data-index="${index}">
                <p><strong>${work.company}</strong></p>
                <p>${work.position}</p>
                <p>${work.duration}</p>
            </div>
        `).join('');
    }

    private renderSkills(): void {
        const skillsContainer = document.getElementById('resumeSkills')!;
        skillsContainer.innerHTML = this.data.skills.map((skill, index) => `
            <li class="editable" data-type="skill" data-index="${index}">${skill}</li>
        `).join('');
    }

    // ... (other methods for editing remain the same)

    private saveResume(): void {
        localStorage.setItem(this.data.username, JSON.stringify(this.data));
    }

    private loadResume(username: string): void {
        const savedData = localStorage.getItem(username);
        if (savedData) {
            this.data = JSON.parse(savedData);
            this.renderResume();
            (document.getElementById('username') as HTMLInputElement).value = username;
        }
    }

    private generateShareableLink(): void {
        const username = this.data.username;
        if (username) {
            const link = `${window.location.origin}?username=${encodeURIComponent(username)}`;
            this.shareableLinkInput.value = link;
        } else {
            alert('Please enter a username and generate a resume first.');
        }
    }

    private loadResumeFromURL(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');
        if (username) {
            this.loadResume(username);
        }
    }

    private downloadPDF(): void {
        const element = this.resumeDisplay;
        html2pdf().from(element).save(`${this.data.username}_resume.pdf`);
    }
}

// Initialize the ResumeBuilder when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResumeBuilder();
});
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import axios from 'axios';

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong']
const CAPTCHA_LENGTH = 5

function generateCaptcha(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: CAPTCHA_LENGTH }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function sanitizeText(input: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${input}</div>`, 'text/html')
    const allowed = ALLOWED_TAGS

    const cleanNode = (node: Node): Node => {
        if (node.nodeType === Node.TEXT_NODE) return node.cloneNode()

        if (
            node.nodeType === Node.ELEMENT_NODE &&
            allowed.includes((node as Element).tagName.toLowerCase())
        ) {
            const clone = node.cloneNode() as HTMLElement
            clone.innerHTML = ''
            node.childNodes.forEach((child) => clone.appendChild(cleanNode(child)))
            for (const attr of (node as Element).attributes) {
                if (['href', 'title'].includes(attr.name)) clone.setAttribute(attr.name, attr.value)
            }
            return clone
        }
        return document.createTextNode(node.textContent || '')
    }

    const sanitized = document.createElement('div')
    doc.body.firstChild?.childNodes.forEach((node) => sanitized.appendChild(cleanNode(node)))
    return sanitized.innerHTML
}

type FormData = {
    userName: string
    email: string
    homepage: string
    text: string
    captcha: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

export default function CommentForm({parent_id, onSubmit}: {parent_id?: number, onSubmit?: () => void}) {
    const [form, setForm] = useState<FormData>({
        userName: '',
        email: '',
        homepage: '',
        text: '',
        captcha: '',
    })
    const [captchaValue, setCaptchaValue] = useState<string>('')
    const [errors, setErrors] = useState<FormErrors>({})
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        setCaptchaValue(generateCaptcha())
    }, [])

    const validate = (): FormErrors => {
        const errs: FormErrors = {}
        if (!/^[a-zA-Z0-9]+$/.test(form.userName)) errs.userName = 'Only latin letters and digits allowed'
        if (!form.userName) errs.userName = 'Required'
        if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Invalid email'
        if (form.homepage && !/^https?:\/\/.+/.test(form.homepage)) errs.homepage = 'Invalid URL'
        if (!form.text) errs.text = 'Required'
        if (form.captcha !== captchaValue) errs.captcha = 'CAPTCHA mismatch'
        return errs
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null
        if (!selected) return

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain']
        if (!validTypes.includes(selected.type)) {
            alert('Only JPG, PNG, GIF images or TXT files allowed')
            return
        }

        if (selected.type === 'text/plain' && selected.size > 100 * 1024) {
            alert('TXT file must be under 100 KB')
            return
        }

        if (selected.type.startsWith('image/')) {
            const img = new Image()
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    img.onload = () => {
                        if (img.width > 320 || img.height > 240) {
                            alert('Image must be up to 320x240 pixels')
                        } else {
                            setFile(selected)
                        }
                    }
                    img.src = event.target.result as string
                }
            }
            reader.readAsDataURL(selected)
        } else {
            setFile(selected)
        }
    }

    const handleTagInsert = (tag: string) => {
        const startTag = `<${tag}>`
        const endTag = `</${tag}>`
        const textarea = document.querySelector<HTMLTextAreaElement>('textarea[name="text"]')
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = form.text.substring(0, start)
        const middle = form.text.substring(start, end)
        const after = form.text.substring(end)

        const newText = before + startTag + middle + endTag + after
        setForm({ ...form, text: newText })

        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + startTag.length, start + startTag.length + middle.length)
        }, 0)
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length !== 0) return

        const formData = new FormData()
        formData.append('parent_id', String(parent_id ?? ''))
        formData.append('text', sanitizeText(form.text))
        formData.append('user_email', form.email)
        formData.append('username', form.userName)
        formData.append('user_home_page_url', form.homepage || '')
        if (file) formData.append('attachment', file)

        axios.post(route('comments.store'), formData).then((r) => {
            if (r.status === 200 && onSubmit) onSubmit()
        })
    }

    return (
        <div className="max-w-xl">
            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                encType="multipart/form-data"
            >
                <h3 className="text-xl font-bold text-neutral-800 dark:text-white">Оставить комментарий</h3>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Имя *</label>
                        <input
                            type="text"
                            name="userName"
                            value={form.userName}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                        {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Сайт</label>
                        <input
                            type="url"
                            name="homepage"
                            value={form.homepage}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                        {errors.homepage && <p className="text-red-500 text-xs mt-1">{errors.homepage}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Комментарий *</label>

                        <div className="mb-2 flex gap-2">
                            {ALLOWED_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagInsert(tag)}
                                    className="rounded bg-neutral-200 px-2 py-1 text-sm dark:bg-neutral-700 dark:text-white"
                                >&lt;{tag}&gt;</button>
                            ))}
                        </div>

                        <textarea
                            name="text"
                            value={form.text}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        ></textarea>
                        {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Вложение</label>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.txt"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-neutral-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-white dark:file:bg-blue-900 dark:file:text-blue-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">CAPTCHA *</label>
                        <div className="mt-1 flex items-center gap-3">
                            <span className="rounded-xl bg-neutral-200 px-3 py-2 font-mono text-base dark:bg-neutral-700 dark:text-white">
                                {captchaValue}
                            </span>
                            <input
                                type="text"
                                name="captcha"
                                value={form.captcha}
                                onChange={handleChange}
                                className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                        </div>
                        {errors.captcha && <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>}
                    </div>
                </div>

                <div className="pt-4 text-end">
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:ring-offset-neutral-900"
                    >
                        Отправить
                    </button>
                </div>
            </form>
        </div>
    )
}

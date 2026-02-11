import React from 'react';
import {
  REACH_BASE, MOVE_BASE, TURN_DATA, POS_DATA, DIS_DATA, STAT, WEIGHT_FACTORS
} from '../utils/mtmLogic';

const MTMReferenceTable = () => {
    // Helper Components for Dense Layout
    const Section = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
        <div className={`border border-black break-inside-avoid bg-white ${className}`}>
            <h3 className="bg-black text-white font-bold text-xs uppercase px-2 py-1 border-b border-black text-center print:text-[8px] print:py-0.5">{title}</h3>
            <div className="p-0 text-[10px] print:text-[7px]">
                {children}
            </div>
        </div>
    );

    const TableHeader = ({ children, width }: { children: React.ReactNode, width?: string }) => (
        <th className={`px-1 py-0.5 border-r border-b border-black last:border-r-0 bg-gray-100 font-bold text-center ${width}`}>{children}</th>
    );

    const TableCell = ({ children, bold = false, align = "center", className="" }: { children: React.ReactNode, bold?: boolean, align?: "left"|"center"|"right", className?: string }) => (
        <td className={`px-1 py-0.5 border-r border-b border-gray-300 last:border-r-0 border-black last:border-b-gray-300 ${bold ? 'font-bold' : ''} text-${align} ${className}`}>{children}</td>
    );

    const renderReach = () => (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader width="15%">Dist</TableHeader>
                    <TableHeader width="14%">A</TableHeader>
                    <TableHeader width="14%">B</TableHeader>
                    <TableHeader width="14%">C/D</TableHeader>
                    <TableHeader width="14%">E</TableHeader>
                    <TableHeader width="14%">mR-A</TableHeader>
                    <TableHeader width="15%">mR-B</TableHeader>
                </tr>
            </thead>
            <tbody>
                {Object.entries(REACH_BASE).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                    <tr key={k} className="even:bg-gray-50">
                        <TableCell bold>{k}</TableCell>
                        <TableCell>{v[0]}</TableCell>
                        <TableCell>{v[1]}</TableCell>
                        <TableCell>{v[2]}</TableCell>
                        <TableCell>{v[3]}</TableCell>
                        <TableCell>{v[4]}</TableCell>
                        <TableCell>{v[5]}</TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderMove = () => (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader width="15%">Dist</TableHeader>
                    <TableHeader width="20%">A</TableHeader>
                    <TableHeader width="20%">B</TableHeader>
                    <TableHeader width="20%">C</TableHeader>
                    <TableHeader width="25%">mM-B</TableHeader>
                </tr>
            </thead>
            <tbody>
                {Object.entries(MOVE_BASE).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                    <tr key={k} className="even:bg-gray-50">
                        <TableCell bold>{k}</TableCell>
                        <TableCell>{v[0]}</TableCell>
                        <TableCell>{v[1]}</TableCell>
                        <TableCell>{v[2]}</TableCell>
                        <TableCell>{v[3]}</TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderWeight = () => (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader>Kg (até)</TableHeader>
                    <TableHeader>Fator (W)</TableHeader>
                    <TableHeader>Const (SC)</TableHeader>
                </tr>
            </thead>
            <tbody>
                {WEIGHT_FACTORS.map((f, i) => (
                    <tr key={i} className="even:bg-gray-50">
                        <TableCell bold>{f.max}</TableCell>
                        <TableCell>{f.w}</TableCell>
                        <TableCell>{f.sc}</TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTurn = () => (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader>Graus</TableHeader>
                    <TableHeader>S</TableHeader>
                    <TableHeader>M</TableHeader>
                    <TableHeader>L</TableHeader>
                </tr>
            </thead>
            <tbody>
                {Object.entries(TURN_DATA).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k, v]) => (
                    <tr key={k} className="even:bg-gray-50">
                        <TableCell bold>{k}°</TableCell>
                        <TableCell>{v[0]}</TableCell>
                        <TableCell>{v[1]}</TableCell>
                        <TableCell>{v[2]}</TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderPos = () => (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader>Classe</TableHeader>
                    <TableHeader>Caso</TableHeader>
                    <TableHeader>Fácil (E)</TableHeader>
                    <TableHeader>Difícil (D)</TableHeader>
                </tr>
            </thead>
            <tbody>
                {Object.entries(POS_DATA).map(([k, v]: any) => {
                    const match = k.match(/^P(\d+)(S|SS|NS)$/);
                    if (!match) return null;
                    return (
                        <tr key={k} className="even:bg-gray-50">
                            <TableCell bold>{match[1]}</TableCell>
                            <TableCell>{match[2]}</TableCell>
                            <TableCell>{v.E}</TableCell>
                            <TableCell>{v.D}</TableCell>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    const renderGrasp = () => (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader width="20%">Cód</TableHeader>
                    <TableHeader width="60%">Descrição</TableHeader>
                    <TableHeader width="20%">TMU</TableHeader>
                </tr>
            </thead>
            <tbody>
                {Object.entries(STAT).filter(([k]) => k.startsWith('G')).map(([k, v]) => (
                    <tr key={k} className="even:bg-gray-50">
                        <TableCell bold>{k}</TableCell>
                        <TableCell align="left">{v.d}</TableCell>
                        <TableCell>{v.t}</TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderRelease = () => (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader width="20%">Cód</TableHeader>
                    <TableHeader width="60%">Descrição</TableHeader>
                    <TableHeader width="20%">TMU</TableHeader>
                </tr>
            </thead>
            <tbody>
                {Object.entries(STAT).filter(([k]) => k.startsWith('RL')).map(([k, v]) => (
                    <tr key={k} className="even:bg-gray-50">
                        <TableCell bold>{k}</TableCell>
                        <TableCell align="left">{v.d}</TableCell>
                        <TableCell>{v.t}</TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderDisengage = () => (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader>Classe</TableHeader>
                    <TableHeader>Fácil (E)</TableHeader>
                    <TableHeader>Difícil (D)</TableHeader>
                </tr>
            </thead>
            <tbody>
                 {Object.entries(DIS_DATA).map(([k, v]: any) => (
                    <tr key={k} className="even:bg-gray-50">
                        <TableCell bold>D{k}</TableCell>
                        <TableCell>{v.E}</TableCell>
                        <TableCell>{v.D}</TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderBody = () => (
        <table className="w-full border-collapse">
             <thead>
                <tr>
                    <TableHeader width="20%">Cód</TableHeader>
                    <TableHeader width="60%">Descrição</TableHeader>
                    <TableHeader width="20%">TMU</TableHeader>
                </tr>
            </thead>
            <tbody>
                 {Object.entries(STAT).filter(([k]) => !k.startsWith('G') && !k.startsWith('RL') && !k.startsWith('AP') && !k.startsWith('E')).map(([k, v]) => (
                    <tr key={k} className="even:bg-gray-50">
                        <TableCell bold>{k}</TableCell>
                        <TableCell align="left">{v.d}</TableCell>
                        <TableCell>{v.t}</TableCell>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="flex-1 bg-white overflow-y-auto p-4 sm:p-8 font-sans text-slate-900 print:bg-white print:p-0">
            <h2 className="text-2xl font-bold text-center mb-6 uppercase tracking-widest border-b-2 border-black pb-2 print:hidden">Tabela de Dados MTM-1</h2>

            {/* Grid Layout mimicking the card */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2 print:text-[8px]">

                {/* Column 1: Reach & Move */}
                <div className="space-y-4 print:space-y-2">
                    <Section title="Alcançar (Reach - R)">{renderReach()}</Section>
                    <Section title="Mover (Move - M)">{renderMove()}</Section>
                    <Section title="Peso (Weight - Gw)">{renderWeight()}</Section>
                </div>

                {/* Column 2: Grasp, Position, Release, Disengage */}
                <div className="space-y-4 print:space-y-2">
                    <Section title="Pegar (Grasp - G)">{renderGrasp()}</Section>
                    <Section title="Posicionar (Position - P)">{renderPos()}</Section>
                    <div className="grid grid-cols-2 gap-4 print:gap-2">
                        <Section title="Soltar (Release - RL)">{renderRelease()}</Section>
                        <Section title="Separar (Disengage - D)">{renderDisengage()}</Section>
                    </div>
                     <Section title="Olhos & Pressão (Eye/AP)">
                        <table className="w-full border-collapse">
                             <tbody>
                                {Object.entries(STAT).filter(([k]) => k.startsWith('AP') || k.startsWith('E')).map(([k, v]) => (
                                    <tr key={k} className="even:bg-gray-50 border-b border-gray-200">
                                        <TableCell bold>{k}</TableCell>
                                        <TableCell align="left">{v.d}</TableCell>
                                        <TableCell>{v.t}</TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Section>
                </div>

                {/* Column 3: Turn, Body */}
                <div className="space-y-4 print:space-y-2">
                    <Section title="Girar (Turn - T)">{renderTurn()}</Section>
                    <Section title="Movimentos do Corpo (Body)">{renderBody()}</Section>

                    {/* Notes Section */}
                    <div className="border border-black p-2 bg-yellow-50 text-[10px] print:text-[7px]">
                        <h4 className="font-bold mb-1 uppercase">Notas Gerais</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>TMU: Time Measurement Unit (1 TMU = 0.0006 min).</li>
                            <li>Distâncias em centímetros (cm).</li>
                            <li>Valores interpolados linearmente.</li>
                            <li>Peso efetivo por mão.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MTMReferenceTable;
